import AddEmployee from "./components/AddEmployee";
import useHasPermission from "../../../hooks/Auth";
import { useEffect, useState } from "react";
import { EmployeeColumn } from "./components/EmployeeColumn";
import { useAllEmployeesQuery } from "../../../services/EmployeeApi";
import DataTable from "../../../components/child/DataTable";

const Employees = () => {
  const { hasPermission } = useHasPermission();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); // default page size
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const columns = EmployeeColumn(hasPermission);
  // 🔹 Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset page on new search
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // 🔹 Fetch employees using current table state
  const { data, isLoading } = useAllEmployeesQuery({
    page,
    limit,
    order,
    sortBy,
    search: debouncedSearch,
    forDropdown: false,
  });

  const employees = data?.data?.employees ?? [];

  if (isLoading) return <p>Loading...</p>;
  return (
    <div className="d-flex flex-column gap-18">
      <div className="card">
        <div className="card-body p-16 p-sm-20 radius-12 p-md-24 d-flex flex-row justify-content-between align-items-center">
          <div className="d-flex flex-column gap-2">
            <h3 className="text-xl mb-0 text-street-dark fw-semibold">
              Employees
            </h3>
            <p className="text-sm mb-0 text-street-base fw-normal">
              Manage your team members and their roles
            </p>
          </div>
          <div className="d-flex flex-row gap-2">
            {hasPermission({ action: "create_employee" }) && <AddEmployee />}
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-body p-16 p-sm-20 radius-12 p-md-24">
          <DataTable
            columns={columns}
            onLimitChange={setLimit}
            data={employees}
            total={data?.data?.paggination?.total ?? 0}
            page={page}
            limit={limit}
            sortBy={sortBy}
            order={order}
            onPageChange={setPage}
            onSortChange={(col, dir) => {
              setSortBy(col);
              setOrder(dir);
            }}
            onSearchChange={(val) => setSearch(val)}
          />
        </div>
      </div>
    </div>
  );
};

export default Employees;
