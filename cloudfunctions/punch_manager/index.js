// cloudfunctions/punch_manager/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_TYPE_CACHED
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { action, data } = event

  switch (action) {
    case 'getRecords':
      return await getRecords(openid)
    case 'addPunch':
      return await addPunch(openid, data)
    default:
      return { success: false, msg: 'Invalid action' }
  }
}

async function getRecords(openid) {
  try {
    const res = await db.collection('punch_records')
      .where({ _openid: openid })
      .orderBy('createTime', 'desc')
      .get()
    return { success: true, data: res.data }
  } catch (err) {
    return { success: false, error: err }
  }
}

async function addPunch(openid, data) {
  try {
    // 1. 添加打卡记录
    await db.collection('punch_records').add({
      data: {
        _openid: openid,
        content: data.content,
        images: data.images,
        createTime: db.serverDate(),
        dateStr: data.dateStr, // YYYY-MM-DD
        timeStr: data.timeStr  // HH:mm
      }
    })

    // 2. 更新用户信息 (总天数等)
    // 注意：这里简单实现，实际逻辑可能更复杂（判断是否连续）
    await db.collection('study_users').where({
      _openid: openid
    }).update({
      data: {
        totalPunchInDays: _.inc(1),
        monthlyPunchInDays: _.inc(1)
      }
    })

    return { success: true }
  } catch (err) {
    return { success: false, error: err }
  }
}