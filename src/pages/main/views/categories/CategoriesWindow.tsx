/**
 * Componente principal para la gestión de categorías.
 *
 * @remarks
 * Permite listar, crear, editar y eliminar categorías.
 * Gestiona el estado de los modales, alertas, filtros y ordenamiento.
 *
 * @returns La vista de administración de categorías.
 */
import { useEffect, useState, useMemo } from "react";
import { getCategories, createCategories, updateCategories, deleteCategories } from "../../../../services/categories/categories.service";
import type { GetCategoryResponse } from "../../../../services/categories/types/GetCategory.type";
import type { CreateCategoryPayload } from "../../../../services/categories/types/CreateCategory.type";
import type { UpdateCategoryPayload } from "../../../../services/categories/types/UpdateCategory.type";
import type { DeleteCategoryPayload } from "../../../../services/categories/types/DeleteCategory.type";
import "./categoriesWindow.css";
import { CreateCategoryModal } from "./subcomponents/CreateCategoryModal";
import { EditDeleteCategoryModal } from "./subcomponents/EditDeleteCategoryModal";
import { CategoriesTable } from "./subcomponents/CategoriesTable";
import { Alert } from "../../../../commons/Alert";

type ModalState = null | {
  type: "edit" | "delete";
  category: GetCategoryResponse;
  loading: boolean;
};

export default function CategoriesWindow() {
  const [categories, setCategories] = useState<GetCategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>(null);
  const [editFields, setEditFields] = useState<Partial<GetCategoryResponse>>({});
  const [createModal, setCreateModal] = useState<{ open: boolean; loading: boolean; name: string }>({ open: false, loading: false, name: "" });
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);

  // Filtros y ordenamiento
  const [filter, setFilter] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const fetchCategories = async () => {
    const token = localStorage.getItem("accessToken") || "";
    const res = await getCategories(token);
    if (res.success && res.data) setCategories(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => setCreateModal({ open: true, loading: false, name: "" });

  const showSuccessAlert = (msg: string) => {
    setSuccessMessage(msg);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const showErrorAlert = (msg: string) => {
    setErrorMessage(msg);
    setShowError(true);
    setTimeout(() => setShowError(false), 2000);
  };

  const handleCreateCategory = async () => {
    setCreateModal(modal => ({ ...modal, loading: true }));
    const token = localStorage.getItem("accessToken") || "";
    if (!createModal.name.trim()) {
      showErrorAlert("El nombre es obligatorio");
      setCreateModal(modal => ({ ...modal, loading: false }));
      return;
    }
    const payload: CreateCategoryPayload = { name: createModal.name.trim() };
    const res = await createCategories(token, payload);
    if (res.success) {
      fetchCategories();
      setCreateModal({ open: false, loading: false, name: "" });
      showSuccessAlert("Categoría creada correctamente");
    } else {
      showErrorAlert("Error al crear categoría");
      setCreateModal(modal => ({ ...modal, loading: false }));
    }
  };

  const handleEdit = (category: GetCategoryResponse) => {
    setEditFields(category);
    setModal({ type: "edit", category, loading: false });
  };

  const handleDelete = (category: GetCategoryResponse) => {
    setModal({ type: "delete", category, loading: false });
  };

  const confirmEdit = async () => {
    if (!modal) return;
    setModal(m => m && { ...m, loading: true });
    const token = localStorage.getItem("accessToken") || "";
    const payload: UpdateCategoryPayload = {
      _id: editFields._id || modal.category._id,
      name: editFields.name || modal.category.name,
    };
    const res = await updateCategories(token, payload);
    if (res.success) {
      fetchCategories();
      showSuccessAlert("Categoría editada correctamente");
    } else {
      showErrorAlert("Error al editar categoría");
    }
    setModal(null);
  };

  const confirmDelete = async () => {
    if (!modal) return;
    setModal(m => m && { ...m, loading: true });
    const token = localStorage.getItem("accessToken") || "";
    const payload: DeleteCategoryPayload = { _id: modal.category._id };
    const res = await deleteCategories(token, payload);
    if (res.success) {
      fetchCategories();
      showSuccessAlert("Categoría eliminada correctamente");
    } else {
      showErrorAlert("Error al eliminar categoría");
    }
    setModal(null);
  };

  // Filtro y ordenamiento
  const filteredCategories = useMemo(() => {
    let filtered = categories;
    if (filter.trim()) {
      filtered = filtered.filter(cat => cat.name.toLowerCase().includes(filter.toLowerCase()));
    }
    filtered = [...filtered].sort((a, b) => {
      if (a.name < b.name) return sortAsc ? -1 : 1;
      if (a.name > b.name) return sortAsc ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [categories, filter, sortAsc]);

  return (
    <div>
      <Alert type="success" message={successMessage} show={showSuccess} />
      <Alert type="error" message={errorMessage} show={showError} />
      <CreateCategoryModal
        open={createModal.open}
        loading={createModal.loading}
        name={createModal.name}
        onClose={() => setCreateModal({ ...createModal, open: false })}
        onChange={name => setCreateModal(modal => ({ ...modal, name }))}
        onCreate={handleCreateCategory}
      />
      <EditDeleteCategoryModal
        modal={modal}
        editFields={editFields}
        setEditFields={setEditFields}
        onClose={() => setModal(null)}
        onEdit={confirmEdit}
        onDelete={confirmDelete}
      />
      <CategoriesTable
        categories={filteredCategories}
        loading={loading}
        filter={filter}
        setFilter={setFilter}
        sortAsc={sortAsc}
        setSortAsc={setSortAsc}
        onEdit={handleEdit}
        onDelete={handleDelete}
        handleOpenCreate={handleOpenCreate}
      />
    </div>
  );
}
