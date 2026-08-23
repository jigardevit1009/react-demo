import { supabase } from "../config/supabase.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

/**
 * @desc    Get employees with Pagination, Search, and Department Filter
 * @route   GET /api/employees?page=1&limit=10&search=...&department=...
 */
export const getEmployees = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search?.trim();
    const department = req.query.department?.trim();
    const all = req.query.all === "true";

    let query = supabase.from("employees").select("*", { count: "exact" });

    // Apply Department filter
    if (department && department !== "ALL") {
      query = query.eq("department", department);
    }

    // Apply Search filter (name, email, or role)
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,role.ilike.%${search}%`
      );
    }

    // Order by ID descending
    query = query.order("id", { ascending: false });

    // If pagination requested (and not all=true)
    if (!isNaN(page) && page > 0 && !all) {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;
      if (error) throw error;

      return sendSuccess(
        res,
        {
          employees: data || [],
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
        },
        "Employees retrieved successfully",
        200
      );
    }

    // Return all employees (useful for dropdowns or unpaginated view)
    const { data, count, error } = await query;
    if (error) throw error;

    return sendSuccess(
      res,
      data || [],
      "Employees retrieved successfully",
      200
    );
  } catch (error) {
    return sendError(res, "Failed to retrieve employees from database", 500, error);
  }
};

/**
 * @desc    Get single employee by ID from Supabase
 * @route   GET /api/employees/:id
 */
export const getEmployeeById = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return sendError(res, `Employee with ID ${id} not found`, 404);
    }
    return sendSuccess(res, data, "Employee retrieved successfully", 200);
  } catch (error) {
    return sendError(res, "Failed to retrieve employee", 500, error);
  }
};

/**
 * @desc    Create a new employee
 * @route   POST /api/employees
 */
export const createEmployee = async (req, res) => {
  const { name, email, role, department, status } = req.body;

  if (!name || !email || !role) {
    return sendError(res, "Name, email, and role are required fields", 400);
  }

  try {
    const { data, error } = await supabase
      .from("employees")
      .insert([
        {
          name,
          email,
          role,
          department: department || "Engineering",
          status: status || "Active",
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return sendSuccess(res, data, "Employee created successfully", 201);
  } catch (error) {
    return sendError(res, "Failed to create employee", 500, error);
  }
};

/**
 * @desc    Update an existing employee
 * @route   PUT /api/employees/:id
 */
export const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { name, email, role, department, status } = req.body;

  try {
    const updatePayload = { updated_at: new Date() };
    if (name !== undefined) updatePayload.name = name;
    if (email !== undefined) updatePayload.email = email;
    if (role !== undefined) updatePayload.role = role;
    if (department !== undefined) updatePayload.department = department;
    if (status !== undefined) updatePayload.status = status;

    const { data, error } = await supabase
      .from("employees")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return sendError(res, `Employee with ID ${id} not found or update failed`, 404);
    }
    return sendSuccess(res, data, "Employee updated successfully", 200);
  } catch (error) {
    return sendError(res, "Failed to update employee", 500, error);
  }
};

/**
 * @desc    Delete an employee
 * @route   DELETE /api/employees/:id
 */
export const deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("employees")
      .delete()
      .eq("id", id)
      .select();

    if (error || !data || data.length === 0) {
      return sendError(res, `Employee with ID ${id} not found`, 404);
    }
    return sendSuccess(res, { id: Number(id) }, `Employee #${id} deleted successfully`, 200);
  } catch (error) {
    return sendError(res, "Failed to delete employee", 500, error);
  }
};
