#!/usr/bin/env node

const si = require('systeminformation')
const chalk = require('chalk')

console.clear()

function generateGauge(value, label, maxLength) {
	const maxBars = 20
	const filledBars = Math.round((value / 100) * maxBars)
	const emptyBars = maxBars - filledBars

	const gauge = chalk.green('[') + chalk.green('■'.repeat(filledBars)) + chalk.gray('□'.repeat(emptyBars)) + chalk.green(']')

	console.log(`${label}${' '.repeat(maxLength - label.length)} ${gauge} ${value.toFixed(2)}%`)
}

async function displaySystemPerformance() {
	const data = {
		cpu: {},
		memory: {},
		disks: []
	}

	const load = await si.currentLoad()
	const memory = await si.mem()
	const usedMemPercentage = (memory.active / memory.total) * 100
	const disks = await si.fsSize()
    const osInfo = await si.osInfo()

	data.cpu.load = load.currentLoad
	data.cpu.label = 'CPU Usage'

	data.memory.load = usedMemPercentage
	data.memory.label = 'Memory Usage'

	disks.forEach((disk, i) => {
		const usedPercentage = (disk.used / disk.size) * 100
		data.disks.push({label: `Disk ${i + 1} Usage (${disk.fs})`, load: usedPercentage})
	})

	let maxLength = 0
	;(function checkLength(obj) {
		if (Array.isArray(obj)) obj.forEach(checkLength)
		else if (obj && typeof obj === 'object') {
			if (obj.label) maxLength = Math.max(maxLength, obj.label.length)
			Object.values(obj).forEach(checkLength)
		}
	})(data);


	Object.values(data).forEach((item) => {
		if (Array.isArray(item)) return item.forEach((gauge) => generateGauge(gauge.load, gauge.label, maxLength))
		generateGauge(item.load, item.label, maxLength)
	})
    console.log(chalk.green("OS Info:"))
    console.log(osInfo.platform)
    console.log(osInfo.distro + " " + osInfo.release + " " + osInfo.codename)
}

displaySystemPerformance()
