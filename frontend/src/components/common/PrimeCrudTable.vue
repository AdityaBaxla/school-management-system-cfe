<template>
  <div>
    <div class="card">
      <Toolbar class="mb-6 mt-6">
        <template #start>
          <Button
            label="New"
            icon="pi pi-plus"
            class="mr-2"
            @click="toggleCreateMode"
          />
          <Button
            label="Delete"
            icon="pi pi-trash"
            severity="danger"
            outlined
            @click="confirmDeleteSelected"
            :disabled="!selectedProducts || !selectedProducts.length"
          />
        </template>

        <template #end>
          <FileUpload
            mode="basic"
            accept="image/*"
            :maxFileSize="1000000"
            label="Import"
            customUpload
            chooseLabel="Import"
            class="mr-2"
            auto
            :chooseButtonProps="{ severity: 'secondary' }"
          />
          <Button
            label="Export"
            icon="pi pi-upload"
            severity="secondary"
            @click="exportCSV($event)"
          />
        </template>
      </Toolbar>

      <!-- DataTable with integrated create form -->
      <DataTable
        :value="createMode ? [newItemData, ...localItems] : localItems"
        editMode="row"
        dataKey="id"
        v-model:editingRows="editingRows"
        v-model:selection="selectedProducts"
        @row-edit-save="onRowEditSave"
        @row-edit-init="onRowEditInit"
        @row-edit-cancel="onRowEditCancel"
        ref="dataTable"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
        class="p-datatable-sm"
        removableSort
        :rowHover="true"
        responsiveLayout="scroll"
        filterDisplay="menu"
        :global-filter-fields="normalizedColumns.map((col) => col.field)"
        :pt="{
          table: { style: 'min-width: 50rem' },
          column: {
            bodycell: ({ state }) => ({
              style:
                state['d_editing'] &&
                'padding-top: 0.75rem; padding-bottom: 0.75rem',
            }),
          },
        }"
      >
        <!-- for search -->
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">{{ props.title }}</h4>
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText
                v-model="filters['global'].value"
                placeholder="Search..."
              />
            </IconField>
          </div>
        </template>
        <!-- search end -->
        <!-- selection box -->
        <Column
          selectionMode="multiple"
          style="width: 3rem"
          :exportable="false"
        ></Column>

        <template v-for="col in normalizedColumns" :key="col.field">
          <Column
            :field="col.field"
            :header="col.header"
            :style="{ width: col.width || '17%' }"
            :editable="col.editable !== false"
          >
            <!-- Create Form Template -->
            <template #body="slotProps">
              <!-- Create Mode first row -->
              <div v-if="createMode && slotProps.data === newItemData">
                <div v-if="!col.editable">-</div>
                <Select
                  v-else-if="col.type === 'dropdown'"
                  v-model="newItemData[col.field]"
                  :options="col.options"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select"
                  class="w-full p-inputtext-sm"
                  @keydown.tab="focusNextInput($event, col.field)"
                  :ref="inputRefs"
                />
                <InputNumber
                  v-else-if="col.type === 'number'"
                  v-model="newItemData[col.field]"
                  class="w-full p-inputtext-sm"
                  @keydown.enter="createItem"
                  @keydown.tab="focusNextInput($event, col.field)"
                  :ref="inputRefs"
                />
                <InputText
                  v-else
                  v-model="newItemData[col.field]"
                  class="w-full p-inputtext-sm"
                  @keydown.enter="createItem"
                  @keydown.tab="focusNextInput($event, col.field)"
                  :ref="inputRefs"
                />
              </div>

              <!-- Regular data rows -->
              <template v-else>
                <span v-if="col.type === 'dropdown'">
                  {{
                    col.options.find(
                      (opt) => opt.value === slotProps.data[col.field]
                    )?.label || ""
                  }}
                </span>
                <span v-else>
                  {{ slotProps.data[col.field] }}
                </span>
              </template>
            </template>

            <!-- Editor Template for edit mode -->
            <template #editor="{ data, field }">
              <div v-if="!col.editable" class="p-1">{{ data[field] }}</div>
              <Select
                v-else-if="col.type === 'dropdown'"
                v-model="editData[data.id][field]"
                :options="col.options"
                optionLabel="label"
                optionValue="value"
                placeholder="Select"
                class="w-full p-input text-sm"
              />
              <InputNumber
                v-else-if="col.type === 'number'"
                v-model="editData[data.id][field]"
                class="w-full p-input text-sm"
              />
              <InputText
                v-else
                v-model="editData[data.id][field]"
                class="w-full p-input text-sm"
              />
            </template>
          </Column>
        </template>

        <!-- Real Row Editor Column -->
        <Column v-if="!createMode" :rowEditor="true" style="width: 7rem">
        </Column>
        <!-- Action Column -->
        <Column
          header="Actions"
          :style="{ width: '10rem' }"
          bodyStyle="text-align:center"
        >
          <template #body="slotProps">
            <!-- Create mode buttons -->
            <div
              v-if="createMode && slotProps.data === newItemData"
              class="flex justify-content- center"
            >
              <Button
                icon="pi pi-check"
                class="p-button-rounded p-button-success p-button-sm mr-2"
                @click="createItem"
              />
              <Button
                icon="pi pi-times"
                class="p-button-rounded p-button-danger p-button-sm"
                @click="cancelCreate"
              />
            </div>

            <!-- Regular row buttons with edit and delete -->
            <div v-else class="flex gap-2 justify-content-center">
              <!-- <Button
                icon="pi pi-pencil"
                class="p-button-rounded p-button-info p-button-sm"
                @click="startEditRow(slotProps)"
                v-if="!isEditing(slotProps.data)"
              /> -->
              <Button
                icon="pi pi-trash"
                class="p-button-rounded p-button-danger p-button-sm"
                @click="confirmDelete(slotProps.data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="deleteDialog"
      header="Confirm"
      :style="{ width: '450px' }"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span>Are you sure you want to delete this item?</span>
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          class="p-button-text"
          @click="deleteDialog = false"
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          class="p-button-text"
          @click="deleteItem"
        />
      </template>
    </Dialog>

    <!-- delete multiple items dialog -->
    <Dialog
      v-model:visible="deleteProductsDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span v-if="product"
          >Are you sure you want to delete the selected products?</span
        >
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          text
          @click="deleteProductsDialog = false"
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          text
          @click="deleteSelectedProducts"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import {
  InputNumber,
  Toolbar,
  FileUpload,
  InputIcon,
  IconField,
} from "primevue";
import { FilterMatchMode } from "@primevue/core/api";
import { useToast } from "primevue/usetoast";

const props = defineProps({
  title: {
    type: String,
    default: "Data Table",
  },
  items: {
    type: Array,
    default: () => [],
  },
  columns: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["row-edit-save", "item-create", "item-delete"]);
const dataTable = ref(null);
const inputRefs = ref([]);
const editData = ref({});
const selectedProducts = ref(null);
const deleteProductsDialog = ref(false);

// for filter (likely redundant)
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
// Create mode state
const createMode = ref(false);

const newItemData = ref({
  // Add a temporary ID for the DataTable's benefit
  id: "new-item-temp-id",
});

// Create a local copy of the items for display
const localItems = ref([]);

// Track which rows are currently being edited
const editingRows = ref([]);

// Delete dialog state
const deleteDialog = ref(false);
const itemToDelete = ref(null);

// Normalize columns with default values
const normalizedColumns = computed(() =>
  props.columns.map((col) => ({
    ...col,
    type: col.type || "text",
    options: col.options || [],
    editable: col.editable === false ? false : true,
    width: col.width || null,
  }))
);

function focusFilterInput(event) {
  // Wait for DOM to render filter input
  setTimeout(() => {
    const filterInput = document.querySelector(".p-dropdown-filter");
    if (filterInput) filterInput.focus();
  }, 0);
}

// Initialize and sync localItems with props.items
watch(
  () => props.items,
  (newItems) => {
    localItems.value = JSON.parse(JSON.stringify(newItems));
  },
  { immediate: true, deep: true }
);
// Initialize editData when a row enters edit mode
watch(
  editingRows,
  (newEditingRows) => {
    if (newEditingRows.length > 0) {
      // For each newly editing row, initialize its edit data
      newEditingRows.forEach((row) => {
        if (!editData.value[row.id]) {
          // Find the item in localItems
          const item = localItems.value.find((i) => i.id === row.id);
          if (item) {
            // Create a deep copy for editing
            editData.value[row.id] = JSON.parse(JSON.stringify(item));
          }
        }
      });
    }
  },
  { immediate: true, deep: true }
);
const onRowEditSave = (event) => {
  const rowId = event.data.id;

  // If we have edit data for this row
  if (editData.value[rowId]) {
    // Get the index of the item in the local items array
    const index = localItems.value.findIndex((item) => item.id === rowId);

    if (index !== -1) {
      // Update the local item with the edited data
      const updatedItem = {
        ...localItems.value[index],
        ...editData.value[rowId],
      };
      localItems.value[index] = updatedItem;

      // Emit the updated data
      emit("row-edit-save", updatedItem);

      // Clean up edit data
      delete editData.value[rowId];
    }
  }
};

// Reset new item data when we toggle create mode
watch(
  createMode,
  (isCreateMode) => {
    if (isCreateMode) {
      // Initialize empty object with all fields
      // Keep the temp ID
      const tempId = newItemData.value.id;
      newItemData.value = { id: tempId };

      normalizedColumns.value.forEach((col) => {
        // Set default values based on column type
        if (col.type === "dropdown" && col.options.length) {
          newItemData.value[col.field] = "";
        } else if (col.type === "number") {
          newItemData.value[col.field] = null;
        } else {
          newItemData.value[col.field] = "";
        }
      });

      // Focus the first input field after DOM update
      nextTick(() => {
        if (inputRefs.value && inputRefs.value.length) {
          const firstInput = inputRefs.value[0];
          if (firstInput && firstInput.$el) {
            const inputElement = firstInput.$el.querySelector("input");
            if (inputElement) {
              inputElement.focus();
            } else {
              firstInput.$el.focus();
            }
          }
        }
      });
    }
  },
  { immediate: true }
);

// Check if a row is being edited
const isEditing = (rowData) => {
  return editingRows.value.some((row) => row.id === rowData.id);
};

// Start editing a row
const startEditRow = (slotProps) => {
  // Find the row element
  const rowElement = slotProps.node;
  if (!rowElement) return;

  // Add this row to editing rows
  editingRows.value = [slotProps.data];

  // Wait for UI to update
  nextTick(() => {
    // After UI update, PrimeVue will render the editor elements
  });
};

// Row editing functions
const originalData = ref({});

const onRowEditInit = (event) => {
  originalData.value[event.data.id] = JSON.parse(JSON.stringify(event.data));
};

const onRowEditCancel = (event) => {
  if (originalData.value[event.data.id]) {
    const index = localItems.value.findIndex(
      (item) => item.id === event.data.id
    );
    if (index !== -1) {
      Object.assign(localItems.value[index], originalData.value[event.data.id]);
    }
    delete originalData.value[event.data.id];
  }
};

// Toggle create mode
const toggleCreateMode = () => {
  createMode.value = !createMode.value;
};

// Cancel create operation
const cancelCreate = () => {
  createMode.value = false;
};

// Handle tab key to focus next input
const focusNextInput = (event, currentField) => {
  const fields = normalizedColumns.value.map((col) => col.field);
  const currentIndex = fields.indexOf(currentField);

  // If this is the last field and tab is pressed, submit the form
  if (currentIndex === fields.length - 1) {
    // Prevent default to avoid moving focus away
    event.preventDefault();
    createItem();
  }
};

// Create new item
const createItem = () => {
  const newItem = { ...newItemData.value };
  delete newItem.id;
  emit("item-create", newItem);
  createMode.value = true;

  // Wait for DOM to update, then focus
  nextTick(() => {
    // inputRefs.value = []; // reset refs before DOM refills it
    nextTick(() => {
      inputRefs.value[0]?.focus();
    });
  });
};

// Confirm delete functions
const confirmDelete = (item) => {
  itemToDelete.value = item;
  deleteDialog.value = true;
};

const deleteItem = () => {
  if (itemToDelete.value) {
    emit("item-delete", itemToDelete.value);

    // Remove from local items
    const index = localItems.value.findIndex(
      (item) => item.id === itemToDelete.value.id
    );
    if (index !== -1) {
      localItems.value.splice(index, 1);
    }

    deleteDialog.value = false;
    itemToDelete.value = null;
  }
};

const exportCSV = () => {
  dataTable.value.exportCSV();
};
const confirmDeleteSelected = () => {
  deleteProductsDialog.value = true;
};
const deleteSelectedProducts = () => {
  products.value = products.value.filter(
    (val) => !selectedProducts.value.includes(val)
  );
  deleteProductsDialog.value = false;
  selectedProducts.value = null;
  toast.add({
    severity: "success",
    summary: "Successful",
    detail: "Products Deleted",
    life: 3000,
  });
};
</script>

<!-- <style scoped>
/* Ensure consistent sizing for all form elements */
:deep(.p-inputtext),
:deep(.p-dropdown),
:deep(.p-inputnumber) {
  height: 2.25rem;
  display: flex;
  align-items: center;
}

/* Fix for alignment issues in edit mode */
:deep(.p-editable-column) {
  padding: 0.5rem;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.5rem;
}

:deep(.p-datatable .p-datatable-tbody > tr.p-row-editing > td) {
  padding: 0.5rem;
}

/* Prevent UI shifts during editing */
:deep(.p-datatable .p-editable-column) {
  display: flex;
  align-items: center;
  min-height: 2.25rem;
}

/* Make sure input fields take full width in edit mode */
:deep(.p-cell-editing) {
  padding: 0.25rem !important;
}

:deep(.p-cell-editing .p-component) {
  width: 100%;
}
</style> -->
