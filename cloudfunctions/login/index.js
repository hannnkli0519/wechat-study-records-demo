// cloudfunctions/login/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_TYPE_CACHED
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    // 1. 查询用户是否已存在
    const userResult = await db.collection('study_users').where({
      _openid: openid
    }).get()

    if (userResult.data.length > 0) {
      // 用户已存在，返回用户信息
      return {
        success: true,
        data: userResult.data[0],
        openid: openid
      }
    } else {
      // 2. 用户不存在，新建用户信息
      const newUser = {
        _openid: openid,
        nickname: '打卡萌新',
        avatarUrl: '/images/avatar.png',
        userId: Math.random().toString(36).substr(2, 9).toUpperCase(),
        totalPunchInDays: 0,
        maxContinuousDays: 0,
        monthlyPunchInDays: 0,
        studyDuration: 2.0,
        wakeUpReminder: false,
        createTime: db.serverDate()
      }
      
      const addResult = await db.collection('study_users').add({
        data: newUser
      })

      return {
        success: true,
        data: { ...newUser, _id: addResult._id },
        openid: openid
      }
    }
  } catch (err) {
    return {
      success: false,
      error: err
    }
  }
}