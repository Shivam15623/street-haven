import MasterLayout from "../masterLayout/MasterLayout";

const BlankPagePage = () => {
  // const [leads, setLeads] = useState([]);
  // const [loading, setLoading] = useState(true);

  // const fetchLeads = async () => {
  //   try {
  //     const res = await axios.get("http://localhost:8000/api/v1/leads/fetch");
  //     if (Array.isArray(res.data.data)) {
  //       setLeads(res.data.data);
  //     }
  //   } catch (err) {
  //     console.error("Failed to fetch leads:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchLeads();
  // }, []);

  // const leadColumn = [
  //   { header: "No", cell: (row, index) => index + 1 },
  //   { header: "Lead ID", accessor: "lead_Id" },
  //   { header: "Company", accessor: "company" },
  //   { header: "Contact Person", accessor: "contactPerson" },
  //   { header: "Contact No", accessor: "contactNo" },
  //   { header: "Email", accessor: "email" },
  //   { header: "Status", accessor: "status" },
  //   { header: "Title", accessor: "title" },
  //   { header: "Description", accessor: "description" },
  //   {
  //     header: "Attachment",
  //     accessor: "attachment",
  //     cell: (row) =>
  //       row.attachment ? (
  //         <a
  //           href={`http://localhost:8000/${row.attachment}`}
  //           target="_blank"
  //           rel="noopener noreferrer"
  //           className="text-primary"
  //         >
  //           View Attachment
  //         </a>
  //       ) : (
  //         "No Attachment"
  //       ),
  //   },
  //   {
  //     header: "Assigned To",
  //     accessor: "assignedTo",
  //     cell: (row) => (row.assignedTo ? row.assignedTo.name : "Unassigned"),
  //   },
  //   {
  //     header: "Due Date",
  //     accessor: "dueDate",
  //     cell: (row) =>
  //       row.dueDate
  //         ? new Date(row.dueDate).toLocaleDateString("en-GB", {
  //             day: "2-digit",
  //             month: "2-digit",
  //             year: "numeric",
  //           })
  //         : "",
  //   },
  //   {
  //     header: "Created On",
  //     accessor: "dueDate",
  //     cell: (row) =>
  //       row.dueDate
  //         ? new Date(row.createdAt).toLocaleDateString("en-GB", {
  //             day: "2-digit",
  //             month: "2-digit",
  //             year: "numeric",
  //           })
  //         : "",
  //   },
  //   {
  //     header: "Modified On",
  //     accessor: "dueDate",
  //     cell: (row) =>
  //       row.dueDate
  //         ? new Date(row.updatedAt).toLocaleDateString("en-GB", {
  //             day: "2-digit",
  //             month: "2-digit",
  //             year: "numeric",
  //           })
  //         : "",
  //   },
  //   {
  //     header: "Actions",
  //     cell: (row) => (
  //       <CreateEditLead
  //         id={row.lead_Id}
  //         sTrigger={<button className="btn btn-secondary">edit</button>}
  //         onSuccess={fetchLeads}
  //       />
  //     ), // use your leadId field
  //   },
  // ];

  return (
    <MasterLayout>
      <div>hi</div>
    </MasterLayout>
  );
};

export default BlankPagePage;
