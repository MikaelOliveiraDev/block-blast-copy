const canvas = document.querySelector("canvas")
const ctx = canvas.getContext("2d")


function update(now) {
	
	render()
	requestAnimationFrame(update)
}
function render() {
	ctx.fillStyle = "#4f6875"
	ctx.fillRect(0,0, canvas.width, canvas.height)

	const text = "Block Blast"
	const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
	gradient.addColorStop(0.3, "white")
	gradient.addColorStop(1, "gold")
	ctx.fillStyle = gradient
	ctx.font = "bold italic 50px Verdana";
	ctx.textBaseline = "alphabetic"
	ctx.textAlign = "center"
	ctx.fillText(text, canvas.width/2, canvas.height/2 - 50)

	// Start button
	const width = 160
	const height = 60
	const x = canvas.width / 2 - width / 2
	const y = canvas.height / 2 - height / 2
	const border = 8
	const hue = 45
	const saturation = 100

	// The square
	ctx.fillStyle = `hsl(${hue}, ${saturation}%, 55%)`
	ctx.fillRect(x, y, width, height)	
	// Left border
	ctx.fillStyle = `hsl(${hue}, ${saturation}%, 62%)`
	ctx.beginPath()
	ctx.moveTo(x, y + height)
	ctx.lineTo(x, y)
	ctx.lineTo(x + border, y + border)
	ctx.lineTo(x + border, y + height - border)
	ctx.lineTo(x, y + height)
	ctx.fill()
	ctx.closePath()
	// Top border
	ctx.fillStyle = `hsl(${hue}, ${saturation}%, 74%)`
	ctx.beginPath()
	ctx.moveTo(x, y)
	ctx.lineTo(x + width, y)
	ctx.lineTo(x + width - border, y + border)
	ctx.lineTo(x + border, y + border)
	ctx.lineTo(x, y)
	ctx.fill()
	ctx.closePath()
	// Right border
	ctx.fillStyle = `hsl(${hue}, ${saturation}%, 48%)`
	ctx.beginPath()
	ctx.moveTo(x + width, y)
	ctx.lineTo(x + width, y + height)
	ctx.lineTo(x + width - border, y + height - border)
	ctx.lineTo(x + width - border, y + border)
	ctx.lineTo(x + width, y)
	ctx.fill()
	ctx.closePath()
	// Bottom border
	ctx.fillStyle = `hsl(${hue}, ${saturation}%, 45%)`
	ctx.beginPath()
	ctx.moveTo(x + width, y + height)
	ctx.lineTo(x, y + height)
	ctx.lineTo(x + border, y + height - border)
	ctx.lineTo(x + width - border, y + height - border)
	ctx.lineTo(x + width, y + height)
	ctx.fill()
	ctx.closePath()

	// Text
	ctx.textBaseline = "middle"
	ctx.font = "bold italic 20px Verdana"
	ctx.fillStyle = "#664d00"
	ctx.fillText("START", x + width/2, y + height / 2)
}

canvas.addEventListener("click", (ev) => {
	const rect = canvas.getBoundingClientRect()
	const mouseX = ev.clientX - rect.left
	const mouseY = ev.clientY - rect.top
	const width = 160
	const height = 60
	const x = canvas.width / 2 - width / 2
	const y = canvas.height / 2 - height / 2

	if (mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height) {
		console.log("START button clicked!")
	}
})


canvas.height = 800;
canvas.width = 450;
update()