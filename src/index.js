const drag = require('./drag')

drag()
/*
pieChart('.chart-pie', [
  {
    value: 1,
    display: "Display 1",
    label: "Label 1"
  },
  {
    value: 2,
    display: "Display 2",
    label: "Label 2"
  },
  {
    value: 3,
    display: "Display 3",
    label: "Label 3"
  }
])*/

// const url = require('url')
// const profile = require('./ads-profile')
//
// // Remove the 1 random blank frame
// profile.frames.shift()
//
// var counts = countFramesByHost()
// var entries = sortedEntries(counts)
//
// logTimeSpent(entries)
//
// function countFramesByHost () {
//   const counts = {}
//
//   profile.frames.forEach(frame => {
//     let host = url.parse(frame.source).host
//     host = host ? host : `(${frame.source})`
//     if (!counts[host]) {
//       counts[host] = 0
//     }
//     counts[host] += 1
//   })
//
//   return counts
// }
//
// function sortedEntries(counts) {
//   var entries = []
//   for (var key in counts) {
//     if (counts.hasOwnProperty(key)) {
//       entries.push([key, counts[key]])
//     }
//   }
//   entries.sort((a,b) => b[1] - a[1])
//   return entries
// }
//
// function logTimeSpent (entries) {
//   const timeEachFrame = profile.frames.length / profile.duration
//   console.log(`Host\tTime (ms)`)
//   entries.forEach(([host, samples]) => {
//     console.log(`${host}\t ${roundTo(samples * timeEachFrame, 3)}`)
//   })
// }
//
// function roundTo (n, digits) {
//   const significance = Math.pow(10, digits)
//   return Math.round(n * significance) / significance
// }
