import { defineStore } from 'pinia'
import { ref } from 'vue'
import { knowledgeApi, type KnowledgeItem } from '@/services/api'

export const useKnowledgeStore = defineStore('knowledge', () => {
  // 状态
  const knowledgeList = ref<KnowledgeItem[]>([])
  const currentKnowledge = ref<KnowledgeItem | null>(null)
  const loading = ref(false)

  // 获取知识库列表
  const fetchKnowledgeList = async () => {
    loading.value = true
    try {
      // TODO: 调用真实接口
      const data = await knowledgeApi.getKnowledgeList()
      knowledgeList.value = data
      return data
    } catch (error) {
      console.error('Failed to fetch knowledge list:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 创建知识条目
  const createKnowledge = async (knowledgeData: Omit<KnowledgeItem, 'id' | 'createTime' | 'updateTime'>) => {
    loading.value = true
    try {
      // TODO: 调用真实接口
      const newKnowledge = await knowledgeApi.createKnowledge(knowledgeData)
      knowledgeList.value.push(newKnowledge)
      return newKnowledge
    } catch (error) {
      console.error('Failed to create knowledge:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 更新知识条目
  const updateKnowledge = async (id: number, knowledgeData: Partial<KnowledgeItem>) => {
    loading.value = true
    try {
      // TODO: 调用真实接口
      const updatedKnowledge = await knowledgeApi.updateKnowledge(id, knowledgeData)
      const index = knowledgeList.value.findIndex(k => k.id === id)
      if (index !== -1) {
        knowledgeList.value[index] = updatedKnowledge
      }
      return updatedKnowledge
    } catch (error) {
      console.error('Failed to update knowledge:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 删除知识条目
  const deleteKnowledge = async (id: number) => {
    loading.value = true
    try {
      // TODO: 调用真实接口
      await knowledgeApi.deleteKnowledge(id)
      knowledgeList.value = knowledgeList.value.filter(k => k.id !== id)
    } catch (error) {
      console.error('Failed to delete knowledge:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 设置当前知识条目
  const setCurrentKnowledge = (knowledge: KnowledgeItem | null) => {
    currentKnowledge.value = knowledge
  }

  // 根据ID获取知识条目
  const getKnowledgeById = (id: number): KnowledgeItem | undefined => {
    return knowledgeList.value.find(k => k.id === id)
  }

  // 根据类型筛选知识条目
  const getKnowledgeByType = (type: KnowledgeItem['type']): KnowledgeItem[] => {
    return knowledgeList.value.filter(k => k.type === type)
  }

  // 根据标签筛选知识条目
  const getKnowledgeByTag = (tag: string): KnowledgeItem[] => {
    return knowledgeList.value.filter(k => k.tags.includes(tag))
  }

  return {
    // 状态
    knowledgeList,
    currentKnowledge,
    loading,

    // 方法
    fetchKnowledgeList,
    createKnowledge,
    updateKnowledge,
    deleteKnowledge,
    setCurrentKnowledge,
    getKnowledgeById,
    getKnowledgeByType,
    getKnowledgeByTag
  }
})
