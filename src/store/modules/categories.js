import axios from 'axios'
import { addCategory, getCategories } from '../../api/api'
import { CATEGORIES_URL } from '../../constants'
import orderBy from 'lodash/orderBy'

const store = {
  state: {
    all: []
  },

  getters: {
    categories(state) {
      return state.all
    }
  },

  actions: {
    async getCategories({ commit }) {
      const categories = await getCategories()
      const formatedCategories = categories.map(cat => {
        const id = +cat.id
        const name = cat.name
        const parentId = +cat.parentId
        const description = cat.description

        let color = cat.color
        if (!color) {
          if (parentId > 0) {
            const parent = categories.find(c => c.id === parentId)
            if (parent && parent.color) {
              color = parent.color
            }
          }
        }
        let iconValue = cat.icon
        let icon = cat.icon
        if (icon) {
          if (/(mdi)/g.test(icon)) icon = `mdi ${icon}`
          if (/(fa)/g.test(icon)) icon = `fa ${icon}`
        } else {
          icon = 'fa fa-industry'
          if (parentId > 0) {
            const parent = categories.find(c => c.id === parentId)
            if (parent && parent.icon) {
              iconValue = parent.icon
              if (/(mdi)/g.test(icon)) icon = `mdi ${parent.icon}`
              if (/(fa)/g.test(icon)) icon = `fa ${parent.icon}`
            }
          }
        }

        return {
          id,
          name,
          color,
          icon,
          iconValue,
          parentId,
          description
        }
      })
      commit('getCategories', formatedCategories)
    },

    async addCategory({ commit, state }, category) {
      console.log('category:', category)

      if (!category.name) {
        console.error('No category name')
        return false
      }

      try {
        const formatedCategory = {
          name: category.name,
          color: category.color,
          icon: category.icon,
          parentId: category.parentId ? category.parentId : 0
        }
        const postData = await addCategory(formatedCategory)
        console.log('post:', postData)
        console.log('post.data:', postData.data)

        if (postData.data) {
          const getCategory = await axios.get(`${CATEGORIES_URL}/${postData.data.id}`, {
            params: { transform: 1 }
          })
          console.log('getCategory.data:', getCategory.data)

          if (getCategory.data) {
            const cat = getCategory.data
            const parentId = +cat.parentId

            let color = cat.color
            if (!color) {
              if (parentId > 0) {
                const parent = state.all.find(c => c.id === parentId)
                if (parent && parent.color) {
                  color = parent.color
                }
              }
            }
            let iconValue = cat.icon
            let icon = cat.icon
            if (icon) {
              if (/(mdi)/g.test(icon)) icon = `mdi ${icon}`
              if (/(fa)/g.test(icon)) icon = `fa ${icon}`
            } else {
              icon = 'fa fa-industry'
              if (parentId > 0) {
                const parent = state.all.find(c => c.id === parentId)
                if (parent && parent.icon) {
                  iconValue = parent.icon
                  if (/(mdi)/g.test(icon)) icon = `mdi ${parent.icon}`
                  if (/(fa)/g.test(icon)) icon = `fa ${parent.icon}`
                }
              }
            }

            commit('addCategory', {
              ...cat,
              iconValue,
              icon,
              color
            })

            return true
          } else {
            console.error('getCategory.data')
            return false
          }
        } else {
          console.error('postData.data')
          return false
        }
      } catch (error) {
        console.error(error)
        return false
      }
    },

    // update
    async updateCategory({ commit, dispatch, state }, category) {
      try {
        console.log(category)
        const postData = await axios.put(`${CATEGORIES_URL}/${category.id}`, category)
        console.log('post:', postData)
        console.log('post.number:', postData.data)

        if (postData.data === 1) {
          const getCategory = await axios.get(`${CATEGORIES_URL}/${category.id}`, {
            params: { transform: 1 }
          })
          console.log('getCategory.data:', getCategory.data)

          if (getCategory.data) {
            const cat = getCategory.data
            const parentId = +cat.parentId

            let color = cat.color
            if (!color) {
              if (parentId > 0) {
                const parent = state.all.find(c => c.id === parentId)
                if (parent && parent.color) {
                  color = parent.color
                }
              }
            }
            let iconValue = cat.icon
            let icon = cat.icon
            if (icon) {
              console.log(1)
              if (/(mdi)/g.test(icon)) icon = `mdi ${icon}`
              if (/(fa)/g.test(icon)) icon = `fa ${icon}`
            } else {
              console.log(2)
              icon = 'fa fa-industry'
              if (parentId > 0) {
                console.log(3)
                const parent = state.all.find(c => c.id === parentId)
                if (parent && parent.icon) {
                  console.log(4)
                  iconValue = parent.icon
                  if (/(mdi)/g.test(icon)) icon = `mdi ${parent.icon}`
                  if (/(fa)/g.test(icon)) icon = `fa ${parent.icon}`
                }
              }
            }
            console.log({ ...cat, iconValue })
            commit('updateCategory', {
              ...cat,
              iconValue,
              icon,
              color
            })
            return true
          } else {
            console.error('updateCategory.data')
            return false
          }
        } else {
          console.error('postData.data')
          return false
        }
      } catch (error) {
        console.error(error)
        return false
      }
    },

    async deleteCategory({ commit, dispatch }, id) {
      console.log('id:', id)
      const request = await axios.delete(`${CATEGORIES_URL}/${id}`)
      console.log('delete:', request)
      console.log('delete.data:', request.data)

      const result = request.data
      if (result === 1) {
        console.log('Ok!')
        commit('deleteCategory', id)
        return true
      } else {
        console.error('Not ok')
        return false
      }
    }
  },

  mutations: {
    getCategories(state, data) {
      state.all = data
    },

    addCategory(state, category) {
      const categories = [category, ...state.all]
      state.all = orderBy(categories, ['name'], ['asc'])
    },

    updateCategory(state, category) {
      const categories = [category, ...state.all.filter(c => c.id !== category.id)]
      state.all = orderBy(categories, ['name'], ['asc'])
    },

    deleteCategory(state, id) {
      state.all = state.all.filter(c => c.id !== id)
    }
  }
}

export default store
