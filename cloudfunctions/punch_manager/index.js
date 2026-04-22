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
      return await getRecords(openid, data)
    case 'getTodayStatus':
      return await getTodayStatus(openid, data)
    case 'checkIn':
      return await checkIn(openid, data)
    case 'addEntry':
      return await addEntry(openid, data)
    default:
      return { success: false, msg: 'Invalid action' }
  }
}

async function getRecords(openid, data) {
  try {
    const year = data && data.year ? data.year : new Date().getFullYear()
    const month = data && data.month ? data.month : new Date().getMonth() + 1
    const monthStr = `${year}-${month.toString().padStart(2, '0')}-`
    const regex = db.RegExp({
      regexp: `^${monthStr}`,
      options: 'i'
    })

    const recordsRes = await db.collection('punch_records')
      .where({ _openid: openid, dateStr: regex })
      .orderBy('createTime', 'desc')
      .limit(500)
      .get()

    const records = recordsRes.data || []
    const checkins = []
    const entries = []

    records.forEach(item => {
      const hasType = typeof item.type === 'string' && item.type.length > 0
      const isLegacy = !hasType
      const hasContent = (item.content && item.content.trim()) || (Array.isArray(item.images) && item.images.length > 0)

      if (item.type === 'checkin' || isLegacy) {
        checkins.push(item)
      }

      if (item.type === 'entry' || (isLegacy && hasContent)) {
        entries.push(item)
      }
    })

    return {
      success: true,
      data: {
        checkins,
        entries
      }
    }
  } catch (err) {
    return { success: false, error: err }
  }
}

async function getTodayStatus(openid, data) {
  try {
    const dateStr = data.dateStr
    const recordsRes = await db.collection('punch_records')
      .where({ _openid: openid, dateStr })
      .orderBy('createTime', 'desc')
      .limit(200)
      .get()

    const records = recordsRes.data || []
    const checkedIn = records.some(item => item.type === 'checkin' || !item.type)
    const entryCount = records.filter(item => {
      const hasType = typeof item.type === 'string' && item.type.length > 0
      const isLegacy = !hasType
      const hasContent = (item.content && item.content.trim()) || (Array.isArray(item.images) && item.images.length > 0)
      return item.type === 'entry' || (isLegacy && hasContent)
    }).length

    return {
      success: true,
      data: {
        checkedIn,
        entryCount
      }
    }
  } catch (err) {
    return { success: false, error: err }
  }
}

async function checkIn(openid, data) {
  try {
    const dateStr = data.dateStr
    const timeStr = data.timeStr

    const existedRes = await db.collection('punch_records')
      .where({ _openid: openid, dateStr })
      .limit(50)
      .get()

    const existed = (existedRes.data || []).some(item => item.type === 'checkin' || !item.type)
    if (existed) {
      return { success: true, data: { already: true } }
    }

    await db.collection('punch_records').add({
      data: {
        _openid: openid,
        type: 'checkin',
        createTime: db.serverDate(),
        dateStr,
        timeStr
      }
    })

    // 2. 更新用户信息 (总天数等)
    await db.collection('study_users').where({
      _openid: openid
    }).update({
      data: {
        totalPunchInDays: _.inc(1),
        monthlyPunchInDays: _.inc(1)
      }
    })

    return { success: true, data: { already: false } }
  } catch (err) {
    return { success: false, error: err }
  }
}

async function addEntry(openid, data) {
  try {
    await db.collection('punch_records').add({
      data: {
        _openid: openid,
        type: 'entry',
        content: data.content || '',
        images: data.images || [],
        createTime: db.serverDate(),
        dateStr: data.dateStr,
        timeStr: data.timeStr
      }
    })

    return { success: true }
  } catch (err) {
    return { success: false, error: err }
  }
}
