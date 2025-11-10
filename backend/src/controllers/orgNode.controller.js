import OrgNode from "../model/orgNode.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";


/* ------------------------------------------------------------------
   📘 Get full organization tree
------------------------------------------------------------------ */
export const orgTreeData = asyncHandler(async (req, res) => {
  const nodes = await OrgNode.find({})
    .populate("supervises", "label department")
    .populate("reportsTo", "label");

  return res
    .status(200)
    .json(new ApiResponse(true, "Organization tree fetched successfully", nodes));
});

/* ------------------------------------------------------------------
   🟢 Add a new node (Only 1 root allowed)
------------------------------------------------------------------ */
export const addNode = asyncHandler(async (req, res) => {
  const { label, department, reportsTo } = req.body;

  // check if root node already exists
  if (!reportsTo) {
    const existingRoot = await OrgNode.findOne({ reportsTo: null });
    if (existingRoot) {
      throw new ApiError(400, "Root node already exists. You can’t create another one.");
    }
  }

  // create the node
  const newNode = await OrgNode.create({
    label,
    department,
    reportsTo: reportsTo || null,
  });

  // if it has a parent → update parent’s supervises array
  if (reportsTo) {
    await OrgNode.findByIdAndUpdate(reportsTo, {
      $addToSet: { supervises: newNode._id },
    });
  }

  return res
    .status(201)
    .json(new ApiResponse(true, "Node created successfully", newNode));
});

/* ------------------------------------------------------------------
   🟡 Edit node details
------------------------------------------------------------------ */
export const editNode = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { label, department, reportsTo } = req.body;

  const node = await OrgNode.findById(id);
  if (!node) {
    throw new ApiError(404, "Node not found");
  }

  // root cannot be reassigned
  if (!node.reportsTo && reportsTo) {
    throw new ApiError(400, "Root node cannot be reassigned");
  }

  // if changing parent
  if (reportsTo && !node._id.equals(reportsTo)) {
    // remove from old parent's supervises
    if (node.reportsTo) {
      await OrgNode.findByIdAndUpdate(node.reportsTo, {
        $pull: { supervises: node._id },
      });
    }

    // add to new parent's supervises
    await OrgNode.findByIdAndUpdate(reportsTo, {
      $addToSet: { supervises: node._id },
    });

    node.reportsTo = reportsTo;
  }

  if (label) node.label = label;
  if (department) node.department = department;

  await node.save();

  return res
    .status(200)
    .json(new ApiResponse(true, "Node updated successfully", node));
});

/* ------------------------------------------------------------------
   🔴 Delete node (Root cannot be deleted)
------------------------------------------------------------------ */
export const deleteNode = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const node = await OrgNode.findById(id);
  if (!node) {
    throw new ApiError(404, "Node not found");
  }

  // root protection
  if (!node.reportsTo) {
    throw new ApiError(400, "Root node cannot be deleted");
  }

  // reassign children (make them report to same parent)
  if (node.supervises.length > 0) {
    await OrgNode.updateMany(
      { _id: { $in: node.supervises } },
      { $set: { reportsTo: node.reportsTo } }
    );

    // also add them to the parent’s supervises
    await OrgNode.findByIdAndUpdate(node.reportsTo, {
      $addToSet: { supervises: { $each: node.supervises } },
    });
  }

  // remove this node from its parent's supervises
  await OrgNode.findByIdAndUpdate(node.reportsTo, {
    $pull: { supervises: node._id },
  });

  // delete the node
  await OrgNode.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(true, "Node deleted successfully"));
});
