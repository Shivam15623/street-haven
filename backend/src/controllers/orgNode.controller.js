
import User from "../model/user.js";

import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";

/* ------------------------------------------------------------------
   📘 Get full organization tree
------------------------------------------------------------------ */
export const orgTreeData = asyncHandler(async (req, res) => {
  const nodes = await User.aggregate([
    // 1️⃣ Lookup supervisor (reportsTo)
    {
      $lookup: {
        from: "users",
        localField: "superviserId",
        foreignField: "_id",
        as: "reportsTo",
      },
    },

    // 2️⃣ Lookup subordinates (supervises)
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "superviserId",
        as: "supervises",
      },
    },

    // 3️⃣ Shape the response
    {
      $project: {
        _id: 1,
        title: 1,
        role: 1,
        profilePic: 1,
        // ✅ current user name
        name: {
          $trim: {
            input: {
              $concat: [
                { $ifNull: ["$firstname", ""] },
                " ",
                { $ifNull: ["$lastname", ""] },
              ],
            },
          },
        },

        // ✅ reportsTo (single object or null)
        reportsTo: {
          $cond: [
            { $gt: [{ $size: "$reportsTo" }, 0] },
            {
              _id: { $arrayElemAt: ["$reportsTo._id", 0] },

              name: {
                $trim: {
                  input: {
                    $concat: [
                      {
                        $ifNull: [
                          { $arrayElemAt: ["$reportsTo.firstname", 0] },
                          "",
                        ],
                      },
                      " ",
                      {
                        $ifNull: [
                          { $arrayElemAt: ["$reportsTo.lastname", 0] },
                          "",
                        ],
                      },
                    ],
                  },
                },
              },
            },
            null,
          ],
        },

        // ✅ supervises (array)
        supervises: {
          $map: {
            input: "$supervises",
            as: "s",
            in: {
              _id: "$$s._id",
              title: "$$s.title",
              name: {
                $trim: {
                  input: {
                    $concat: [
                      { $ifNull: ["$$s.firstname", ""] },
                      " ",
                      { $ifNull: ["$$s.lastname", ""] },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(true, "Organization tree fetched successfully", nodes)
    );
});

