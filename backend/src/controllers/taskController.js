import { supabase } from "../config/supabase.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

/**
 * @desc    Get tasks with Pagination, Status, Priority, and Search Filters (Pure VARCHAR Assignee)
 * @route   GET /api/tasks?page=1&limit=10&status=...&priority=...&search=...
 */
export const getTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10) || 10;
    const status = req.query.status?.trim();
    const priority = req.query.priority?.trim();
    const search = req.query.search?.trim();
    const all = req.query.all === "true";

    let query = supabase.from("tasks").select("*", { count: "exact" });

    // Status filter
    if (status && status !== "ALL") {
      query = query.ilike("status", status);
    }

    // Priority filter
    if (priority && priority !== "ALL") {
      query = query.eq("priority", priority);
    }

    // Search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,assignee.ilike.%${search}%`);
    }

    query = query.order("id", { ascending: false });

    // Normalize task record (pure VARCHAR string assignee)
    const normalizeTask = (task) => ({
      id: task.id,
      title: task.title,
      assignee: task.assignee || "Unassigned",
      priority: task.priority || "Medium",
      status: task.status || "Pending",
      dueDate: task.due_date || task.dueDate || null,
      createdAt: task.created_at || task.createdAt,
      updatedAt: task.updated_at || task.updatedAt,
    });

    // Pagination
    if (!isNaN(page) && page > 0 && !all) {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;
      if (error) throw error;

      return sendSuccess(
        res,
        {
          tasks: (data || []).map(normalizeTask),
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
        },
        "Tasks retrieved successfully",
        200
      );
    }

    const { data, error } = await query;
    if (error) throw error;

    return sendSuccess(
      res,
      (data || []).map(normalizeTask),
      "Tasks retrieved successfully",
      200
    );
  } catch (error) {
    return sendError(res, "Failed to retrieve tasks from database", 500, error);
  }
};

/**
 * @desc    Get single task by ID
 * @route   GET /api/tasks/:id
 */
export const getTaskById = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return sendError(res, `Task with ID ${id} not found`, 404);
    }

    const normalizedTask = {
      id: data.id,
      title: data.title,
      assignee: data.assignee || "Unassigned",
      priority: data.priority || "Medium",
      status: data.status || "Pending",
      dueDate: data.due_date || data.dueDate || null,
      createdAt: data.created_at || data.createdAt,
      updatedAt: data.updated_at || data.updatedAt,
    };

    return sendSuccess(res, normalizedTask, "Task retrieved successfully", 200);
  } catch (error) {
    return sendError(res, "Failed to retrieve task", 500, error);
  }
};

/**
 * @desc    Create a new task storing assignee directly as VARCHAR string
 * @route   POST /api/tasks
 */
export const createTask = async (req, res) => {
  const { title, assignee, priority, status, dueDate } = req.body;

  if (!title) {
    return sendError(res, "Task title is required", 400);
  }

  try {
    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          title,
          assignee: assignee || "Unassigned",
          priority: priority || "Medium",
          status: status || "Pending",
          due_date: dueDate || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    const normalizedTask = {
      id: data.id,
      title: data.title,
      assignee: data.assignee || "Unassigned",
      priority: data.priority,
      status: data.status,
      dueDate: data.due_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return sendSuccess(res, normalizedTask, "Task created successfully", 201);
  } catch (error) {
    return sendError(res, "Failed to create task", 500, error);
  }
};

/**
 * @desc    Update an existing task
 * @route   PUT /api/tasks/:id
 */
export const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, assignee, priority, status, dueDate } = req.body;

  try {
    const updatePayload = { updated_at: new Date() };
    if (title !== undefined) updatePayload.title = title;
    if (assignee !== undefined) updatePayload.assignee = assignee;
    if (priority !== undefined) updatePayload.priority = priority;
    if (status !== undefined) updatePayload.status = status;
    if (dueDate !== undefined) updatePayload.due_date = dueDate;

    const { data, error } = await supabase
      .from("tasks")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return sendError(res, `Task with ID ${id} not found or update failed`, 404);
    }

    const normalizedTask = {
      id: data.id,
      title: data.title,
      assignee: data.assignee || "Unassigned",
      priority: data.priority,
      status: data.status,
      dueDate: data.due_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return sendSuccess(res, normalizedTask, "Task updated successfully", 200);
  } catch (error) {
    return sendError(res, "Failed to update task", 500, error);
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 */
export const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .select();

    if (error || !data || data.length === 0) {
      return sendError(res, `Task with ID ${id} not found`, 404);
    }
    return sendSuccess(res, { id: Number(id) }, `Task #${id} deleted successfully`, 200);
  } catch (error) {
    return sendError(res, "Failed to delete task", 500, error);
  }
};
