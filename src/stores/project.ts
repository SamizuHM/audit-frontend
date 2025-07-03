import { defineStore } from 'pinia'
import { ref } from 'vue'
import { projectApi, type AuditProject } from '@/services/api'

export const useProjectStore = defineStore('project', () => {
  // 状态
  const projects = ref<AuditProject[]>([])
  const currentProject = ref<AuditProject | null>(null)
  const loading = ref(false)

  // 获取项目列表
  const fetchProjects = async () => {
    loading.value = true
    try {
      // TODO: 调用真实接口
      const data = await projectApi.getProjects()
      projects.value = data
      return data
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 创建项目
  const createProject = async (projectData: Omit<AuditProject, 'id' | 'createTime' | 'updateTime'>) => {
    loading.value = true
    try {
      // TODO: 调用真实接口
      const newProject = await projectApi.createProject(projectData)
      projects.value.push(newProject)
      return newProject
    } catch (error) {
      console.error('Failed to create project:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 更新项目
  const updateProject = async (id: number, projectData: Partial<AuditProject>) => {
    loading.value = true
    try {
      // TODO: 调用真实接口
      const updatedProject = await projectApi.updateProject(id, projectData)
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }
      return updatedProject
    } catch (error) {
      console.error('Failed to update project:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 删除项目
  const deleteProject = async (id: number) => {
    loading.value = true
    try {
      // TODO: 调用真实接口
      await projectApi.deleteProject(id)
      projects.value = projects.value.filter(p => p.id !== id)
    } catch (error) {
      console.error('Failed to delete project:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 设置当前项目
  const setCurrentProject = (project: AuditProject | null) => {
    currentProject.value = project
  }

  // 根据ID获取项目
  const getProjectById = (id: number): AuditProject | undefined => {
    return projects.value.find(p => p.id === id)
  }

  return {
    // 状态
    projects,
    currentProject,
    loading,

    // 方法
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
    getProjectById
  }
})
