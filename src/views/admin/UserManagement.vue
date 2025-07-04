<template>
  <div class="user-management-container">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="search-section">
        <span class="search-label">用户搜索：</span>
        <el-input
          v-model="searchForm.keyword"
          placeholder="请输入姓名或身份证号"
          style="width: 200px"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
      <div>
        <el-button
          v-if="permissionStore.hasButtonPermission('admin:user:add')"
          type="success"
          @click="handleAddUser"
        >
          <el-icon><UserFilled /></el-icon>
          新增用户
        </el-button>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="table-container">
      <div class="table-header">
        <el-icon><User /></el-icon>
        用户列表
      </div>

      <el-table
        v-loading="loading"
        :data="paginatedUsers"
        style="width: 100%"
        row-key="id"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="index" label="序号" width="80" />

        <el-table-column prop="name" label="姓名" min-width="120">
          <template #default="{ row }">
            <span class="user-name">{{ row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="idCard" label="身份证号" min-width="180">
          <template #default="{ row }">
            <span class="id-card">{{ formatIdCard(row.idCard) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="role" label="身份信息" min-width="120">
          <template #default="{ row }">
            <el-tag
              :type="getRoleTagType(row.role)"
              size="small"
            >
              {{ getRoleText(row.role) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" min-width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="lastLoginTime" label="最后登录" min-width="180">
          <template #default="{ row }">
            {{ row.lastLoginTime ? formatDate(row.lastLoginTime) : '从未登录' }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button
                v-if="permissionStore.hasButtonPermission('admin:user:edit')"
                type="primary"
                size="small"
                @click="handleEditUser(row)"
              >
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button
                v-if="permissionStore.hasButtonPermission('admin:user:delete')"
                type="danger"
                size="small"
                @click="handleDeleteUser(row)"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredUsers.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 编辑用户弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="editForm.id ? '编辑用户' : '新增用户'"
      width="500px"
      :before-close="handleCloseEditDialog"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="100px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入姓名" />
        </el-form-item>

        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="editForm.idCard" placeholder="请输入身份证号" />
        </el-form-item>

        <el-form-item label="用户角色" prop="role">
          <el-select v-model="editForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="审计员" value="staff" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="!editForm.id" label="初始密码" prop="password">
          <el-input
            v-model="editForm.password"
            type="password"
            placeholder="请输入初始密码"
            show-password
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveUser">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import {
  Search,
  UserFilled,
  User,
  Edit,
  Delete
} from '@element-plus/icons-vue'
import { usePermissionStore } from '@/stores/permission'

const permissionStore = usePermissionStore()

interface UserData {
  id: string
  name: string
  idCard: string
  role: 'admin' | 'staff'
  createTime: string
  lastLoginTime?: string
}

// 响应式数据
const loading = ref(false)
const users = ref<UserData[]>([])
const editDialogVisible = ref(false)
const editFormRef = ref<FormInstance>()

// 搜索表单
const searchForm = reactive({
  keyword: ''
})

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)

// 编辑表单
const editForm = reactive({
  id: '',
  name: '',
  idCard: '',
  role: 'staff',
  password: ''
})

// 表单验证规则
const editRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, message: '身份证号格式不正确', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入初始密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

// 过滤后的用户列表
const filteredUsers = computed(() => {
  let result = users.value

  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(user =>
      user.name.toLowerCase().includes(keyword) ||
      user.idCard.includes(keyword)
    )
  }

  return result
})

// 分页后的用户列表
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredUsers.value.slice(start, end)
})

// 获取角色标签类型
const getRoleTagType = (role: string) => {
  const roleMap: Record<string, string> = {
    admin: 'warning',
    staff: 'success'
  }
  return roleMap[role] || ''
}

// 获取角色文本
const getRoleText = (role: string) => {
  const roleMap: Record<string, string> = {
    admin: '管理员',
    staff: '审计员'
  }
  return roleMap[role] || role
}

// 格式化身份证号（中间打码）
const formatIdCard = (idCard: string) => {
  if (!idCard || idCard.length !== 18) return idCard
  return idCard.substring(0, 6) + '********' + idCard.substring(14)
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
}

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

// 处理当前页变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

// 处理选择变化
const handleSelectionChange = (selection: UserData[]) => {
  // 处理多选逻辑
  console.log('选中的用户:', selection)
}

// 新增用户
const handleAddUser = () => {
  resetEditForm()
  editDialogVisible.value = true
}

// 编辑用户
const handleEditUser = (user: UserData) => {
  Object.assign(editForm, {
    id: user.id,
    name: user.name,
    idCard: user.idCard,
    role: user.role,
    password: ''
  })
  editDialogVisible.value = true
}

// 删除用户
const handleDeleteUser = async (user: UserData) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户"${user.name}"吗？删除后无法恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // TODO: 调用删除接口
    await deleteUser(user.id)

    ElMessage.success('删除成功')
    await fetchUsers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 保存用户
const handleSaveUser = async () => {
  if (!editFormRef.value) return

  try {
    const valid = await editFormRef.value.validate()
    if (!valid) return

    // TODO: 调用保存接口
    if (editForm.id) {
      await updateUser(editForm)
    } else {
      await createUser(editForm)
    }

    ElMessage.success(editForm.id ? '更新成功' : '创建成功')
    editDialogVisible.value = false
    await fetchUsers()
  } catch (error) {
    ElMessage.error(editForm.id ? '更新失败' : '创建失败')
  }
}

// 关闭编辑弹窗
const handleCloseEditDialog = () => {
  resetEditForm()
  editDialogVisible.value = false
}

// 重置编辑表单
const resetEditForm = () => {
  Object.assign(editForm, {
    id: '',
    name: '',
    idCard: '',
    role: 'staff',
    password: ''
  })
  if (editFormRef.value) {
    editFormRef.value.clearValidate()
  }
}

// API 方法（模拟）
const fetchUsers = async () => {
  loading.value = true
  try {
    // TODO: 调用实际的用户列表接口
    // const response = await api.getUserList()

    // 模拟数据
    await new Promise(resolve => setTimeout(resolve, 500))
    users.value = [
      {
        id: '1',
        name: '张审计员',
        idCard: '110101199001011234',
        role: 'staff',
        createTime: '2024-01-15 10:30:00',
        lastLoginTime: '2024-07-04 09:15:00'
      },
      {
        id: '2',
        name: '李管理员',
        idCard: '110101199002022345',
        role: 'admin',
        createTime: '2024-01-10 14:20:00',
        lastLoginTime: '2024-07-04 08:30:00'
      },
      {
        id: '3',
        name: '王审计员',
        idCard: '110101199003033456',
        role: 'staff',
        createTime: '2024-02-01 16:45:00'
      }
    ]
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const createUser = async (userData: any) => {
  // TODO: 调用实际的创建用户接口
  console.log('创建用户:', userData)
  await new Promise(resolve => setTimeout(resolve, 500))
}

const updateUser = async (userData: any) => {
  // TODO: 调用实际的更新用户接口
  console.log('更新用户:', userData)
  await new Promise(resolve => setTimeout(resolve, 500))
}

const deleteUser = async (userId: string) => {
  // TODO: 调用实际的删除用户接口
  console.log('删除用户:', userId)
  await new Promise(resolve => setTimeout(resolve, 500))
}

// 组件挂载时获取数据
onMounted(async () => {
  await fetchUsers()
})
</script>

<style scoped>
.user-management-container {
  padding: 0;
}

/* 工具栏 */
.toolbar {
  background: #fff;
  border-radius: 6px;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-label {
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  font-weight: 500;
}

/* 表格容器 */
.table-container {
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
}

.table-header {
  background: linear-gradient(135deg, #1890ff);
  color: white;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-weight: 500;
  color: #1890ff;
}

.id-card {
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.operation-buttons {
  display: flex;
  gap: 8px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 16px;
  background: #fff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .search-section {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .operation-buttons {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
