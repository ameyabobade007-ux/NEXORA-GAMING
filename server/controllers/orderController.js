import Order from "../models/Order.js";
import Game from "../models/Game.js";
import User from "../models/User.js";

// =========================================================
// CREATE ORDER
// =========================================================

export async function create(req, res) {
  try {
    const {
      items,
      billing,
      paymentMethod = "Demo UPI",
    } = req.body;

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message: "Cart is empty.",
      });
    }

    for (const item of items) {
      const quantity = Number(item.qty);

      if (!item.game) {
        return res.status(400).json({
          message: "Invalid game in cart.",
        });
      }

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return res.status(400).json({
          message: `Invalid quantity for ${
            item.title || "game"
          }.`,
        });
      }

      const game = await Game.findById(
        item.game
      );

      if (!game) {
        return res.status(404).json({
          message: `${
            item.title || "Game"
          } is no longer available.`,
        });
      }

      if (Number(game.stock) <= 0) {
        return res.status(400).json({
          message: `${game.title} is out of stock.`,
        });
      }

      if (
        Number(game.stock) < quantity
      ) {
        return res.status(400).json({
          message: `Only ${game.stock} copy/copies of ${game.title} available.`,
        });
      }
    }

    const reservedItems = [];

    for (const item of items) {
      const quantity = Number(item.qty);

      const updatedGame =
        await Game.findOneAndUpdate(
          {
            _id: item.game,
            stock: {
              $gte: quantity,
            },
          },
          {
            $inc: {
              stock: -quantity,
            },
          },
          {
            new: true,
          }
        );

      if (!updatedGame) {
        for (const reserved of reservedItems) {
          await Game.findByIdAndUpdate(
            reserved.game,
            {
              $inc: {
                stock: reserved.qty,
              },
            }
          );
        }

        return res.status(400).json({
          message: `${
            item.title ||
            "This game"
          } is no longer available in the requested quantity.`,
        });
      }

      reservedItems.push({
        game: item.game,
        qty: quantity,
      });
    }

    const total = items.reduce(
      (sum, item) =>
        sum +
        Number(item.price) *
          Number(item.qty),
      0
    );

    let order;

    try {
      order = await Order.create({
        user: req.user._id,
        items,
        total,
        billing,
        paymentMethod,
      });
    } catch (orderError) {
      for (const reserved of reservedItems) {
        await Game.findByIdAndUpdate(
          reserved.game,
          {
            $inc: {
              stock: reserved.qty,
            },
          }
        );
      }

      throw orderError;
    }

    const ids = items.map(
      (item) => item.game
    );

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: {
          purchasedGames: {
            $each: ids,
          },
        },

        $set: {
          achievements: [
            "Early Adopter",
            "First Purchase",
          ],
        },
      }
    );

    return res.status(201).json(order);
  } catch (error) {
    console.error(
      "CREATE ORDER ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Unable to create order.",
    });
  }
}

// =========================================================
// CUSTOMER ORDERS
// =========================================================

export async function mine(req, res) {
  try {
    const orders = await Order.find({
      user: req.user._id,
      hiddenFromCustomer: {
        $ne: true,
      },
    }).sort({
      createdAt: -1,
    });

    return res.json(orders);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

// =========================================================
// ADMIN - ALL ORDERS
// =========================================================

export async function all(req, res) {
  try {
    const orders = await Order.find()
      .populate(
        "user",
        "name email"
      )
      .sort({
        createdAt: -1,
      });

    return res.json(orders);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

// =========================================================
// ADMIN UPDATE ORDER STATUS
// =========================================================

export async function update(req, res) {
  try {
    const { status } = req.body;

    const order =
      await Order.findById(
        req.params.id
      );

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    const oldStatus = order.status;

    // Digital game order statuses
    const allowedStatuses = [
      "Processing",
      "Confirmed",
      "Activated",
      "Completed",
      "Cancelled",
    ];

    if (
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        message: "Invalid order status.",
      });
    }

    if (oldStatus === status) {
      return res.json(order);
    }

    // Restore stock when an order is cancelled.
    if (
      status === "Cancelled" &&
      oldStatus !== "Cancelled"
    ) {
      for (const item of order.items) {
        const quantity = Number(
          item.qty
        );

        if (
          !item.game ||
          quantity <= 0
        ) {
          continue;
        }

        await Game.findByIdAndUpdate(
          item.game,
          {
            $inc: {
              stock: quantity,
            },
          }
        );
      }
    }

    order.status = status;

    await order.save();

    return res.json(order);
  } catch (error) {
    console.error(
      "UPDATE ORDER ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Unable to update order.",
    });
  }
}

// =========================================================
// CUSTOMER CANCEL ORDER
// =========================================================

export async function cancelOrder(
  req,
  res
) {
  try {
    const order =
      await Order.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (
      order.status === "Cancelled"
    ) {
      return res.status(400).json({
        message:
          "This order is already cancelled.",
      });
    }

    // Activated and Completed orders
    // can no longer be cancelled.
    if (
      order.status === "Activated" ||
      order.status === "Completed"
    ) {
      return res.status(400).json({
        message:
          "This order can no longer be cancelled.",
      });
    }

    if (
      order.status !== "Processing" &&
      order.status !== "Confirmed"
    ) {
      return res.status(400).json({
        message:
          "This order cannot be cancelled.",
      });
    }

    // Restore stock.
    for (const item of order.items) {
      const quantity = Number(
        item.qty
      );

      if (
        !item.game ||
        quantity <= 0
      ) {
        continue;
      }

      await Game.findByIdAndUpdate(
        item.game,
        {
          $inc: {
            stock: quantity,
          },
        }
      );
    }

    order.status = "Cancelled";

    await order.save();

    return res.json({
      message:
        "Order cancelled successfully.",
      order,
    });
  } catch (error) {
    console.error(
      "CANCEL ORDER ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Unable to cancel order.",
    });
  }
}

// =========================================================
// CUSTOMER REMOVE CANCELLED ORDER
// =========================================================

export async function removeCancelledOrder(
  req,
  res
) {
  try {
    const order =
      await Order.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (
      order.status !== "Cancelled"
    ) {
      return res.status(400).json({
        message:
          "Only cancelled orders can be removed from your order history.",
      });
    }

    order.hiddenFromCustomer = true;

    await order.save();

    return res.json({
      message:
        "Cancelled order removed from your order history.",
    });
  } catch (error) {
    console.error(
      "REMOVE CANCELLED ORDER ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Unable to remove cancelled order.",
    });
  }
}

// =========================================================
// ADMIN REMOVE CANCELLED ORDER
// =========================================================

export async function removeCancelledOrderAdmin(
  req,
  res
) {
  try {
    const order =
      await Order.findById(
        req.params.id
      );

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (
      order.status !== "Cancelled"
    ) {
      return res.status(400).json({
        message:
          "Only cancelled orders can be removed.",
      });
    }

    await Order.findByIdAndDelete(
      req.params.id
    );

    return res.json({
      message:
        "Cancelled order removed successfully.",
    });
  } catch (error) {
    console.error(
      "ADMIN REMOVE ORDER ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Unable to remove cancelled order.",
    });
  }
}