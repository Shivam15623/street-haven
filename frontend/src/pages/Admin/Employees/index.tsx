import React, { useState } from "react";
import { useAllEmployeesQuery } from "../../../services/EmployeeApi";
import DataTable from "../../../components/child/DataTable";
import { EmployeeColumn } from "./components/EmployeeColumn";

const Employees = () => {
  // 🔹 State for table controls
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); // default page size
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");

  // 🔹 Fetch employees using current table state
  const { data, isLoading } = useAllEmployeesQuery({
    page,
    limit,
    order,
    sortBy,
    search,
  });

  const employees = data?.data?.employees ?? [];

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="d-flex flex-column gap-8 gap-sm-16 gap-md-24">
      <DataTable
        columns={EmployeeColumn}
        onLimitChange={setLimit}
        data={employees}
        total={data?.data.paggination.total ?? 0}
        page={page}
        limit={limit}
        sortBy={sortBy}
        order={order}
        onPageChange={setPage}
        onSortChange={(col, dir) => {
          setSortBy(col);
          setOrder(dir);
        }}
        onSearchChange={(val) => {
          setPage(1); // reset to first page on search
          setSearch(val);
        }}
      />
    </div>
  );
};

export default Employees;
