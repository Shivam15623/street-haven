import  { useEffect, useState } from "react";
import useHasPermission from "../../../../hooks/Auth";
import { EmployeeColumn } from "./EmployeeColumn";
import { useAllEmployeesQuery } from "../../../../services/EmployeeApi";
import DataTable from "../../../../components/child/DataTable";

const EmployeesTab = () => {
      const [page, setPage] = useState(1);
      const [limit, setLimit] = useState(10); // default page size
      const [sortBy, setSortBy] = useState("createdAt");
      const [order, setOrder] = useState<"asc" | "desc">("desc");
      const [search, setSearch] = useState("");
      const [debouncedSearch, setDebouncedSearch] = useState("");
      const { hasPermission } = useHasPermission();
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
  );
};

export default EmployeesTab;
