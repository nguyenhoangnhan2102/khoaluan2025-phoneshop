import React, { useState, useEffect } from "react";
import DynamicTable from "../../share/dynamicTable-component";
import userService from "../../services/userAccountService";
import UserModal from "../modal/user-modal";

const UserComponent = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortColumn, setSortColumn] = useState("id");
    const [sortOrder, setSortOrder] = useState("asc");
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editting, setEditing] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await userService.getAllUser();
            const mappedResponse = response.map((item) => ({
                ...item,
                id: item.manguoidung,
                roleMapVietnamese:
                    item.role === 1
                        ? "Quản trị viên"
                        : item.role === 2
                            ? "Nhân viên"
                            : "Người dùng",
            }));
            setUsers(mappedResponse);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    // Hàm search
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filter danh sách theo searchTerm
    const filteredData = users.filter((user) =>
        user.hoten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.sodienthoai?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sắp xếp dữ liệu (nếu cần)
    const sortedData = [...filteredData].sort((a, b) => {
        if (a[sortColumn] < b[sortColumn]) return sortOrder === "asc" ? -1 : 1;
        if (a[sortColumn] > b[sortColumn]) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });

    // Định nghĩa các cột
    const columns = [
        { key: "id", label: "ID" },
        { key: "hoten", label: "Họ tên" },
        { key: "sodienthoai", label: "Số điện thoại" },
        { key: "email", label: "Email" },
        { key: "diachi", label: "Địa chỉ" },
        { key: "roleMapVietnamese", label: "Vai trò" },
    ];

    return (
        <div className="mt-3">
            <div className="group-header d-flex justify-content-between align-items-center">
                <h2 className="mb-0">Danh sách người dùng</h2>

                {/* Ô tìm kiếm */}
                <div className="filterGroup" style={{ position: "relative", width: "224px" }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm kiếm"
                        value={searchTerm}
                        onChange={handleSearch}
                        style={{ paddingRight: "30px" }} // Chừa chỗ cho icon
                    />
                    <i
                        className="fa-solid fa-magnifying-glass"
                        style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                            color: "#000"
                        }}
                    ></i>
                </div>
            </div>
            {/* Hiển thị table */}
            <DynamicTable
                columns={columns}
                data={sortedData}
                hideDeleteButton={true}
                onEdit={(id) => {
                    const selected = sortedData.find((u) => u.id === id);
                    setEditing(selected);
                    setShowModal(true);
                }}
            />

            <UserModal
                open={showModal}
                onClose={() => setShowModal(false)}
                onSave={() => {
                    fetchData();
                    setShowModal(false);
                }}
                user={editting}
                isView={false}
            />
        </div>
    );
};

export default UserComponent;
