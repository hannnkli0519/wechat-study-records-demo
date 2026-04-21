// cloudfunctions/user_manager/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_TYPE_CACHED
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { action, data } = event

  try {
    switch (action) {
      case 'getUserInfo':
        const userRes = await db.collection('study_users').where({ _openid: openid }).get()
        return { 
          success: true, 
          data: userRes.data.length > 0 ? userRes.data[0] : null 
        }

      case 'updateProfile':
        await db.collection('study_users').where({ _openid: openid }).update({
          data: {
            nickname: data.nickname,
            avatarUrl: data.avatarUrl
          }
        })
        return { success: true }
      
      case 'updateSettings':
        await db.collection('study_users').where({ _openid: openid }).update({
          data: {
            studyDuration: data.studyDuration,
            wakeUpReminder: data.wakeUpReminder
          }
        })
        return { success: true }

      default:
        return { success: false, msg: 'Invalid action' }
    }
  } catch (err) {
    return { success: false, error: err }
  }
}