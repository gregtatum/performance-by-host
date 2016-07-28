const url = require('url')

function parseProfile (profile) {
  // Remove the 1 random blank frame
  profile.frames.shift()

  var counts = countFramesByHost(profile)
  var entries = sortedEntries(counts)

  // logTimeSpent(profile, entries)
  console.table(entries)
  return toD3DataStructure(entries)
}

module.exports = parseProfile

function toD3DataStructure (entries) {
  return entries.map(([host, count]) => {
    return {
      value: count,
      display: `${count}ms`,
      label: host
    }
  })
}

function countFramesByHost (profile) {
  const counts = {}
  profile.frames.forEach(frame => {
    let host = url.parse(frame.source || "").host
    host = host ? host : `(${frame.source})`
    if (!counts[host]) {
      counts[host] = 0
    }
    counts[host] += 1
  })

  return counts
}

function sortedEntries(counts) {
  var entries = []
  for (var key in counts) {
    if (counts.hasOwnProperty(key)) {
      entries.push([key, counts[key]])
    }
  }
  entries.sort((a,b) => b[1] - a[1])
  return entries
}

function logTimeSpent (profile, entries) {
  const timeEachFrame = profile.frames.length / profile.duration
  console.log(`Host\tTime (ms)`)
  entries.forEach(([host, samples]) => {
    console.log(`${host}\t ${roundTo(samples * timeEachFrame, 3)}`)
  })
}

function roundTo (n, digits) {
  const significance = Math.pow(10, digits)
  return Math.round(n * significance) / significance
}
