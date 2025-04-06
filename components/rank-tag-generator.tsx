"use client"

import type React from "react"

import {useRef, useState, useEffect, useCallback} from "react"
import {
    Download,
    Upload,
    Palette,
    Type,
    Layout,
    ArrowDownUp,
    RulerIcon,
    Sparkles,
    Layers,
    Save,
    Trash2,
    Undo,
    Redo,
    Loader2,
    Maximize2,
    Minimize2,
    Bookmark,
    BookmarkPlus,
    Hash,
    Users,
    User2,
    SendHorizontal,
    MessageSquare,
    Heart,
    Trophy,
    Award,
    Swords,
    User,
    FileJson,
} from "lucide-react"
import {Card, CardContent} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Slider} from "@/components/ui/slider"
import {Switch} from "@/components/ui/switch"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import {toast} from "@/components/ui/use-toast"
import {Toaster} from "@/components/ui/toaster"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {Badge} from "@/components/ui/badge"

type TagSettings = {
    text: string
    textColor: string
    bgColor: string
    useGradient: boolean
    gradientColor: string
    gradientDirection: boolean
    addBorder: boolean
    borderWidth: number
    borderColor: string
    iconPosition: string
    iconSize: number
    cornerRadius: number
    imageHeight: number
    padding: number
    fontSize: number
    fontWeight: string
    fontStyle: string
    textTransform: string
    shadow: boolean
    shadowColor: string
    shadowBlur: number
    shadowOffsetX: number
    shadowOffsetY: number

    tagShape: "rectangle" | "pill" | "hexagon" | "diamond"
    fontFamily: string
    backgroundPattern: string
    letterSpacing: number
    textAlign: "left" | "center" | "right"
    animation: "none" | "pulse" | "bounce" | "shake" | "glow"
}

type SavedTemplate = {
    id: string
    name: string
    settings: TagSettings
    createdAt: string
}

class GIFEncoder {
    private width: number
    private height: number
    private frames: ImageData[] = []
    private delays: number[] = []

    constructor(width: number, height: number) {
        this.width = width
        this.height = height
    }

    addFrame(imageData: ImageData, delay = 100) {
        this.frames.push(imageData)
        this.delays.push(delay)
    }

    async createGIF(): Promise<string> {
        const canvas = document.createElement("canvas")
        canvas.width = this.width
        canvas.height = this.height
        const ctx = canvas.getContext("2d")!

        const frameImages: HTMLImageElement[] = []

        for (const frame of this.frames) {
            ctx.putImageData(frame, 0, 0)

            const img = new Image()
            img.src = canvas.toDataURL("image/png")

            await new Promise((resolve) => {
                img.onload = resolve
            })

            frameImages.push(img)
        }

        const animCanvas = document.createElement("canvas")
        animCanvas.width = this.width
        animCanvas.height = this.height
        const animCtx = animCanvas.getContext("2d")!

        return canvas.toDataURL("image/png")
    }
}

export default function RankTagGenerator() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [iconImage, setIconImage] = useState<HTMLImageElement | null>(null)
    const [dimensions, setDimensions] = useState({width: 0, height: 0})
    const [isExpanded, setIsExpanded] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [templateName, setTemplateName] = useState("")
    const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([])
    const [history, setHistory] = useState<TagSettings[]>([])
    const [historyIndex, setHistoryIndex] = useState(-1)
    const [showMockup, setShowMockup] = useState(true)
    const [previewMode, setPreviewMode] = useState<"chat" | "forum" | "game" | "plain">("chat")
    const [isCreatingGif, setIsCreatingGif] = useState(false)
    const [gifProgress, setGifProgress] = useState(0)

    const [showJsonDialog, setShowJsonDialog] = useState(false)
    const [jsonContent, setJsonContent] = useState("")
    const [jsonFileName, setJsonFileName] = useState("")
    const [showAnimationDialog, setShowAnimationDialog] = useState(false)

    const [settings, setSettings] = useState<TagSettings>({
        text: "OWNER",
        textColor: "#FFFFFF",
        bgColor: "#6D28D9", // Purple color for dark mode
        useGradient: true,
        gradientColor: "#DB2777", // Pink color for dark mode
        gradientDirection: false, // false = horizontal, true = vertical
        addBorder: true,
        borderWidth: 2,
        borderColor: "#9D4EDD", // Light purple for border
        iconPosition: "left",
        iconSize: 20,
        cornerRadius: 25, // More rounded corners
        imageHeight: 30, // Slightly taller
        padding: 12,
        fontSize: 16,
        fontWeight: "normal",
        fontStyle: "normal",
        textTransform: "uppercase",
        shadow: false,
        shadowColor: "rgba(0,0,0,0.5)",
        shadowBlur: 4,
        shadowOffsetX: 2,
        shadowOffsetY: 2,

        tagShape: "rectangle",
        fontFamily: "Inter",
        backgroundPattern: "none",
        letterSpacing: 0,
        textAlign: "center",
        animation: "none",
    })

    const updateSetting = <K extends keyof TagSettings>(key: K, value: TagSettings[K]) => {
        if (historyIndex < history.length - 1) {
            setHistory((prev) => prev.slice(0, historyIndex + 1))
        }

        setHistory((prev) => [...prev, {...settings}])
        setHistoryIndex((prev) => prev + 1)

        setSettings((prev) => ({
            ...prev,
            [key]: value,
        }))
    }

    const canUndo = historyIndex >= 0
    const canRedo = historyIndex < history.length - 1

    const handleUndo = () => {
        if (!canUndo) return

        const prevSettings = history[historyIndex]
        setSettings(prevSettings)
        setHistoryIndex((prev) => prev - 1)
    }

    const handleRedo = () => {
        if (!canRedo) return

        const nextSettings = history[historyIndex + 1]
        setSettings(nextSettings)
        setHistoryIndex((prev) => prev + 1)
    }

    const presets = [
        {
            name: "Purple Gradient",
            bgColor: "#6D28D9",
            gradientColor: "#DB2777",
            textColor: "#FFFFFF",
            borderColor: "#9D4EDD",
            useGradient: true,
            addBorder: true,
            shadow: false,
        },
        {
            name: "Neon Green",
            bgColor: "#064E3B",
            gradientColor: "#10B981",
            textColor: "#ECFDF5",
            borderColor: "#34D399",
            useGradient: true,
            addBorder: true,
            shadow: true,
            shadowColor: "rgba(16, 185, 129, 0.6)",
        },
        {
            name: "Dark Blue",
            bgColor: "#1E3A8A",
            gradientColor: "#3B82F6",
            textColor: "#FFFFFF",
            borderColor: "#60A5FA",
            useGradient: true,
            addBorder: true,
            shadow: false,
        },
        {
            name: "Crimson",
            bgColor: "#7F1D1D",
            gradientColor: "#EF4444",
            textColor: "#FFFFFF",
            borderColor: "#F87171",
            useGradient: true,
            addBorder: true,
            shadow: false,
        },
        {
            name: "Cyberpunk",
            bgColor: "#0F172A",
            gradientColor: "#F59E0B",
            textColor: "#000000",
            borderColor: "#FBBF24",
            useGradient: true,
            addBorder: true,
            shadow: true,
            shadowColor: "rgba(245, 158, 11, 0.6)",
        },
        {
            name: "Pastel Dream",
            bgColor: "#8B5CF6",
            gradientColor: "#EC4899",
            textColor: "#FFFFFF",
            borderColor: "#F0ABFC",
            useGradient: true,
            addBorder: true,
            shadow: false,
        },
        {
            name: "Midnight",
            bgColor: "#111827",
            gradientColor: "#374151",
            textColor: "#F9FAFB",
            borderColor: "#4B5563",
            useGradient: true,
            addBorder: true,
            shadow: false,
        },
        {
            name: "Sunset",
            bgColor: "#7C3AED",
            gradientColor: "#F43F5E",
            textColor: "#FFFFFF",
            borderColor: "#C084FC",
            useGradient: true,
            addBorder: true,
            shadow: true,
            shadowColor: "rgba(244, 63, 94, 0.4)",
        },
    ]

    const applyPreset = (preset: any) => {
        updateSetting("bgColor", preset.bgColor)
        updateSetting("gradientColor", preset.gradientColor)
        updateSetting("textColor", preset.textColor)
        updateSetting("borderColor", preset.borderColor)
        updateSetting("useGradient", preset.useGradient)
        updateSetting("addBorder", preset.addBorder)
        updateSetting("shadow", preset.shadow || false)
        if (preset.shadow) {
            updateSetting("shadowColor", preset.shadowColor || "rgba(0,0,0,0.5)")
        }

        toast({
            title: "Preset Applied",
            description: `Applied the ${preset.name} preset`,
        })
    }

    const drawRoundedRect = (
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number,
    ) => {
        const r = (Math.min(width, height) * radius) / 100
        ctx.beginPath()
        ctx.moveTo(x + r, y)
        ctx.arcTo(x + width, y, x + width, y + height, r)
        ctx.arcTo(x + width, y + height, x, y + height, r)
        ctx.arcTo(x, y + height, x, y, r)
        ctx.arcTo(x, y, x + width, y, r)
        ctx.closePath()
    }

    const drawHexagon = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
        const h = height
        const w = width
        const sideLength = h / 2

        ctx.beginPath()
        ctx.moveTo(x + sideLength, y)
        ctx.lineTo(x + w - sideLength, y)
        ctx.lineTo(x + w, y + h / 2)
        ctx.lineTo(x + w - sideLength, y + h)
        ctx.lineTo(x + sideLength, y + h)
        ctx.lineTo(x, y + h / 2)
        ctx.closePath()
    }

    const drawDiamond = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
        const h = height
        const w = width

        ctx.beginPath()
        ctx.moveTo(x + w / 2, y)
        ctx.lineTo(x + w, y + h / 2)
        ctx.lineTo(x + w / 2, y + h)
        ctx.lineTo(x, y + h / 2)
        ctx.closePath()
    }

    const drawShape = useCallback((
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        shape: string,
        radius: number,
    ) => {
        switch (shape) {
            case "rectangle":
                drawRoundedRect(ctx, x, y, width, height, radius)
                break
            case "pill":
                drawRoundedRect(ctx, x, y, width, height, 50)
                break
            case "hexagon":
                drawHexagon(ctx, x, y, width, height)
                break
            case "diamond":
                drawDiamond(ctx, x, y, width, height)
                break
            default:
                drawRoundedRect(ctx, x, y, width, height, radius)
        }
    }, [])

    const applyBackgroundPattern = (
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        pattern: string,
    ) => {
        if (pattern === "none") return

        const patternCanvas = document.createElement("canvas")
        const patternCtx = patternCanvas.getContext("2d")
        if (!patternCtx) return

        patternCanvas.width = 20
        patternCanvas.height = 20

        patternCtx.fillStyle = "rgba(255, 255, 255, 0.05)"

        switch (pattern) {
            case "dots":
                patternCtx.beginPath()
                patternCtx.arc(5, 5, 1, 0, Math.PI * 2)
                patternCtx.arc(15, 15, 1, 0, Math.PI * 2)
                patternCtx.fill()
                break
            case "lines":
                patternCtx.beginPath()
                patternCtx.moveTo(0, 10)
                patternCtx.lineTo(20, 10)
                patternCtx.lineWidth = 1
                patternCtx.strokeStyle = "rgba(255, 255, 255, 0.05)"
                patternCtx.stroke()
                break
            case "grid":
                patternCtx.beginPath()
                patternCtx.moveTo(0, 10)
                patternCtx.lineTo(20, 10)
                patternCtx.moveTo(10, 0)
                patternCtx.lineTo(10, 20)
                patternCtx.lineWidth = 1
                patternCtx.strokeStyle = "rgba(255, 255, 255, 0.05)"
                patternCtx.stroke()
                break
            case "diagonal":
                patternCtx.beginPath()
                patternCtx.moveTo(0, 0)
                patternCtx.lineTo(20, 20)
                patternCtx.lineWidth = 1
                patternCtx.strokeStyle = "rgba(255, 255, 255, 0.05)"
                patternCtx.stroke()
                break
        }

        const bgPattern = ctx.createPattern(patternCanvas, "repeat")
        if (bgPattern) {
            ctx.fillStyle = bgPattern
            ctx.fillRect(x, y, width, height)
        }
    }

    const updateCanvas = useCallback((animationPhase = 0) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const fontString = `${settings.fontStyle} ${settings.fontWeight} ${settings.fontSize}px '${settings.fontFamily}', sans-serif`
        ctx.font = fontString

        let displayText = settings.text
        if (settings.textTransform === "uppercase") {
            displayText = displayText.toUpperCase()
        } else if (settings.textTransform === "lowercase") {
            displayText = displayText.toLowerCase()
        } else if (settings.textTransform === "capitalize") {
            displayText = displayText
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(" ")
        }

        if (settings.letterSpacing !== 0) {
            displayText = displayText.split("").join("\u200A".repeat(settings.letterSpacing))
        }

        const textWidth = ctx.measureText(displayText).width
        const iconSpacing = iconImage ? settings.iconSize + settings.padding : 0
        const width = textWidth + settings.padding * 2 + iconSpacing
        const height = settings.imageHeight

        const canvasWidth = width + (settings.addBorder ? settings.borderWidth * 2 : 0)
        const canvasHeight = height + (settings.addBorder ? settings.borderWidth * 2 : 0)

        canvas.width = canvasWidth
        canvas.height = canvasHeight

        setDimensions({width: canvasWidth, height: canvasHeight})

        const drawX = settings.addBorder ? settings.borderWidth : 0
        const drawY = settings.addBorder ? settings.borderWidth : 0

        ctx.font = fontString

        let shadowBlur = settings.shadowBlur
        let shadowColor = settings.shadowColor

        if (settings.animation === "pulse" || settings.animation === "glow") {
            const intensity = 0.5 + Math.sin(animationPhase * Math.PI * 2) * 0.5

            if (settings.animation === "glow") {
                shadowBlur = settings.shadowBlur + intensity * 10

                const rgbaMatch = settings.shadowColor.match(/rgba$$(\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)$$/)
                if (rgbaMatch) {
                    const r = Number.parseInt(rgbaMatch[1])
                    const g = Number.parseInt(rgbaMatch[2])
                    const b = Number.parseInt(rgbaMatch[3])
                    const alpha = Math.min(1, Number.parseFloat(rgbaMatch[4]) + intensity * 0.3)
                    shadowColor = `rgba(${r}, ${g}, ${b}, ${alpha})`
                }
            }
        }

        if (settings.shadow) {
            ctx.shadowColor = shadowColor
            ctx.shadowBlur = shadowBlur
            ctx.shadowOffsetX = settings.shadowOffsetX
            ctx.shadowOffsetY = settings.shadowOffsetY
        }

        if (settings.useGradient) {
            const gradient = settings.gradientDirection
                ? ctx.createLinearGradient(drawX, drawY, drawX, drawY + height)
                : ctx.createLinearGradient(drawX, drawY, drawX + width, drawY)
            gradient.addColorStop(0, settings.bgColor)
            gradient.addColorStop(1, settings.gradientColor)
            ctx.fillStyle = gradient
        } else {
            ctx.fillStyle = settings.bgColor
        }

        drawShape(ctx, drawX, drawY, width, height, settings.tagShape, settings.cornerRadius)
        ctx.fill()

        if (settings.backgroundPattern !== "none") {
            ctx.save()
            drawShape(ctx, drawX, drawY, width, height, settings.tagShape, settings.cornerRadius)
            ctx.clip()
            applyBackgroundPattern(ctx, drawX, drawY, width, height, settings.backgroundPattern)
            ctx.restore()
        }

        ctx.shadowColor = "transparent"
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        if (settings.addBorder) {
            ctx.strokeStyle = settings.borderColor
            ctx.lineWidth = settings.borderWidth
            drawShape(ctx, drawX, drawY, width, height, settings.tagShape, settings.cornerRadius)
            ctx.stroke()
        }

        ctx.font = fontString
        ctx.fillStyle = settings.textColor
        ctx.textBaseline = "middle"

        if (settings.textAlign === "center") {
            ctx.textAlign = "center"
        } else if (settings.textAlign === "right") {
            ctx.textAlign = "right"
        } else {
            ctx.textAlign = "left"
        }

        if (settings.shadow) {
            ctx.shadowColor = shadowColor
            ctx.shadowBlur = shadowBlur
            ctx.shadowOffsetX = settings.shadowOffsetX
            ctx.shadowOffsetY = settings.shadowOffsetY
        }

        let textX
        if (settings.textAlign === "center") {
            textX = drawX + width / 2
        } else if (settings.textAlign === "right") {
            textX = drawX + width - settings.padding
        } else {
            textX = settings.padding + drawX
            if (iconImage && settings.iconPosition === "left") {
                textX += settings.iconSize + settings.padding
            }
        }

        let textY = drawY + height / 2 + 2

        if (settings.animation === "bounce") {
            const bounceOffset = Math.sin(animationPhase * Math.PI * 2) * 3
            textY += bounceOffset
        } else if (settings.animation === "shake") {
            const shakeOffset = Math.sin(animationPhase * Math.PI * 2) * 2
            textX += shakeOffset
        }

        ctx.fillText(displayText, textX, textY)

        if (iconImage) {
            const currentShadow = {
                color: ctx.shadowColor,
                blur: ctx.shadowBlur,
                offsetX: ctx.shadowOffsetX,
                offsetY: ctx.shadowOffsetY,
            }

            ctx.shadowColor = "transparent"
            ctx.shadowBlur = 0
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 0

            if (settings.iconPosition === "left") {
                ctx.drawImage(
                    iconImage,
                    settings.padding + drawX,
                    drawY + (height - settings.iconSize) / 2,
                    settings.iconSize,
                    settings.iconSize,
                )
            } else {
                ctx.drawImage(
                    iconImage,
                    drawX + width - settings.padding - settings.iconSize,
                    drawY + (height - settings.iconSize) / 2,
                    settings.iconSize,
                    settings.iconSize,
                )
            }

            ctx.shadowColor = currentShadow.color
            ctx.shadowBlur = currentShadow.blur
            ctx.shadowOffsetX = currentShadow.offsetX
            ctx.shadowOffsetY = currentShadow.offsetY
        }

        return ctx.getImageData(0, 0, canvasWidth, canvasHeight)
    }, [settings, iconImage, drawShape])

    const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                const img = new Image()
                img.onload = () => {
                    setIconImage(img)
                }
                img.src = (event.target?.result as string)
                img.crossOrigin = "anonymous"
            }
            reader.readAsDataURL(file)
        }
    }

    const handleDownload = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        setIsLoading(true)

        setTimeout(() => {
            const fileName = `rank-prefix-${settings.text.toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString(36)}`
            const link = document.createElement("a")
            link.download = `${fileName}.png`
            link.href = canvas.toDataURL()
            link.click()

            setIsLoading(false)

            toast({
                title: "Success!",
                description: "Your RankTag has been downloaded",
            })
        }, 500)
    }

    const createMinecraftJson = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const fileName = `rank-prefix-${settings.text.toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString(36)}`

        const jsonData = {
            providers: [
                {
                    type: "bitmap",
                    file: `minecraft:guis/prefixes/${fileName}.png`,
                    ascent: 7,
                    height: 7,
                    chars: [""],
                },
            ],
        }

        const jsonString = JSON.stringify(jsonData, null, 4)

        setJsonContent(jsonString)
        setJsonFileName(fileName)
        setShowJsonDialog(true)
    }

    const downloadMinecraftJson = () => {
        if (!jsonContent) return

        setIsLoading(true)

        const blob = new Blob([jsonContent], {type: "application/json"})

        const url = URL.createObjectURL(blob)

        const link = document.createElement("a")
        link.href = url
        link.download = `${jsonFileName}.json`
        link.click()

        URL.revokeObjectURL(url)

        setIsLoading(false)
        setShowJsonDialog(false)

        toast({
            title: "Success!",
            description: "Minecraft Resource Pack JSON has been downloaded",
        })
    }

    const createAnimatedGif = async () => {
        const canvas = canvasRef.current
        if (!canvas || settings.animation === "none") return

        setIsLoading(true)
        setIsCreatingGif(true)
        setGifProgress(0)

        try {
            const encoder = new GIFEncoder(canvas.width, canvas.height)

            const frames = 12

            for (let i = 0; i < frames; i++) {
                const phase = i / frames
                setGifProgress(Math.round((i / frames) * 100))

                const imageData = updateCanvas(phase)
                if (imageData) {
                    encoder.addFrame(imageData, 100)
                }

                await new Promise((resolve) => setTimeout(resolve, 50))
            }

            const gifDataUrl = await encoder.createGIF()

            const link = document.createElement("a")
            link.download = `ranktag-${settings.animation}.gif`
            link.href = gifDataUrl
            link.click()

            toast({
                title: "Animation erstellt!",
                description: `Dein animierter RankTag wurde als GIF exportiert.`,
            })
        } catch (error) {
            console.error("Fehler beim Erstellen des GIFs:", error)
            toast({
                title: "Fehler",
                description: "Es gab ein Problem beim Erstellen des animierten GIFs.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
            setIsCreatingGif(false)
        }
    }

    const saveTemplate = () => {
        if (!templateName.trim()) {
            toast({
                title: "Error",
                description: "Please enter a template name",
                variant: "destructive",
            })
            return
        }

        const newTemplate: SavedTemplate = {
            id: Date.now().toString(),
            name: templateName,
            settings: {...settings},
            createdAt: new Date().toISOString(),
        }

        setSavedTemplates((prev) => [...prev, newTemplate])
        setTemplateName("")

        toast({
            title: "Template Saved",
            description: `"${templateName}" has been saved to your templates`,
        })
    }

    const loadTemplate = (template: SavedTemplate) => {
        setHistory((prev) => [...prev, {...settings}])
        setHistoryIndex((prev) => prev + 1)

        setSettings(template.settings)

        toast({
            title: "Template Loaded",
            description: `"${template.name}" has been loaded`,
        })
    }

    const deleteTemplate = (id: string, name: string) => {
        setSavedTemplates((prev) => prev.filter((template) => template.id !== id))

        toast({
            title: "Template Deleted",
            description: `"${name}" has been deleted`,
        })
    }

    useEffect(() => {
        updateCanvas()
    }, [settings, iconImage, previewMode, updateCanvas])

    useEffect(() => {
        const timer = setTimeout(() => {
            updateCanvas()
        }, 50)
        return () => clearTimeout(timer)
    }, [previewMode, updateCanvas])

    useEffect(() => {
        updateCanvas()
        setHistory([{...settings}])
        setHistoryIndex(0)
    }, [settings, updateCanvas]);

    useEffect(() => {
        if (settings.animation === "none") return

        let animationFrame: number
        let startTime: number

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const elapsed = timestamp - startTime

            const phase = (elapsed % 2000) / 2000

            updateCanvas(phase)

            animationFrame = requestAnimationFrame(animate)
        }

        animationFrame = requestAnimationFrame(animate)

        return () => {
            cancelAnimationFrame(animationFrame)
        }
    }, [settings.animation, updateCanvas])

    const getAnimationClass = () => {
        switch (settings.animation) {
            case "pulse":
                return "animate-pulse"
            case "bounce":
                return "animate-bounce"
            case "shake":
                return "animate-[wiggle_1s_ease-in-out_infinite]"
            case "glow":
                return "animate-[glow_2s_ease-in-out_infinite]"
            default:
                return ""
        }
    }

    return (
        <div className="flex flex-col items-center space-y-8">
            {/* Canvas Preview */}
            <style jsx global>{`
                @keyframes wiggle {
                    0%, 100% {
                        transform: rotate(-3deg);
                    }
                    50% {
                        transform: rotate(3deg);
                    }
                }

                @keyframes glow {
                    0%, 100% {
                        filter: drop-shadow(0 0 5px rgba(124, 58, 237, 0.5));
                    }
                    50% {
                        filter: drop-shadow(0 0 15px rgba(124, 58, 237, 0.8));
                    }
                }

                @font-face {
                    font-family: 'Minecraft';
                    src: url('https://dl.dropboxusercontent.com/s/rpabl0txpn4fmme/Minecraft.woff2') format('woff2'),
                    url('https://dl.dropboxusercontent.com/s/e7cg6yi82u5j9ku/Minecraft.woff') format('woff');
                    font-weight: normal;
                    font-style: normal;
                    font-display: swap;
                }
            `}</style>
            <div className={`relative transition-all duration-300 ease-in-out ${isExpanded ? "w-full" : "w-auto"}`}>
                <div
                    className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div
                    className="relative bg-gradient-to-b from-card to-card/80 p-6 rounded-lg shadow-xl border border-purple-500/10">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline"
                                   className="bg-purple-500/10 text-purple-300 border-purple-500/20 px-2 py-0">
                                Preview
                            </Badge>
                            <Select
                                value={previewMode}
                                onValueChange={(value) => setPreviewMode(value as "chat" | "forum" | "game" | "plain")}
                            >
                                <SelectTrigger className="h-7 text-xs w-[110px] bg-background/40 border-none">
                                    <SelectValue placeholder="Select mode"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="chat">Chat View</SelectItem>
                                    <SelectItem value="forum">Forum View</SelectItem>
                                    <SelectItem value="game">Game UI</SelectItem>
                                    <SelectItem value="plain">Plain Tag</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setIsExpanded(!isExpanded)}
                                            className="h-8 w-8 bg-background/40 hover:bg-background/60"
                                        >
                                            {isExpanded ? <Minimize2 size={16}/> : <Maximize2 size={16}/>}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{isExpanded ? "Collapse preview" : "Expand preview"}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>

                    <div className="bg-zinc-900 rounded-md overflow-hidden shadow-2xl border border-zinc-800">
                        {previewMode === "chat" && (
                            <div className="flex flex-col">
                                <div
                                    className="bg-zinc-800 px-4 py-3 border-b border-zinc-700 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Hash size={18} className="text-zinc-400"/>
                                        <span className="font-medium text-zinc-300">general-chat</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <Users size={16}/>
                                        <span className="text-xs">128</span>
                                    </div>
                                </div>

                                <div className="p-4 space-y-6">
                                    <div className="flex items-start gap-3">
                                        <div
                                            className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-700 to-purple-900 flex items-center justify-center text-purple-300 flex-shrink-0">
                                            <User size={20}/>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-medium text-zinc-300">NoahLTR</span>
                                                <canvas ref={canvasRef} className={`shadow-lg ${getAnimationClass()}`}/>
                                                <span className="text-xs text-zinc-500">Today at 10:42 AM</span>
                                            </div>
                                            <p className="text-zinc-400 mt-1">
                                                Hey everyone! Just wanted to share the latest update on our project.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div
                                            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center text-blue-300 flex-shrink-0">
                                            <User2 size={20}/>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-zinc-300">JavaExceptionDE</span>
                                                <span className="text-xs text-zinc-500">Today at 10:45 AM</span>
                                            </div>
                                            <p className="text-zinc-400 mt-1">Looks great! Can&#39;t wait to see the
                                                final
                                                version.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-zinc-800/50 p-3 border-t border-zinc-700/50">
                                    <div className="flex items-center gap-2">
                                        <Input placeholder="Message #general-chat"
                                               className="bg-zinc-700/30 border-zinc-700 text-sm h-9"/>
                                        <Button size="icon" variant="ghost"
                                                className="h-9 w-9 bg-zinc-700/30 hover:bg-zinc-700/50">
                                            <SendHorizontal size={16} className="text-zinc-400"/>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {previewMode === "forum" && (
                            <div className="flex flex-col">
                                <div className="bg-zinc-800 px-4 py-3 border-b border-zinc-700">
                                    <h3 className="font-medium text-zinc-300">Latest Announcements</h3>
                                </div>

                                <div className="p-4">
                                    <div className="bg-zinc-800/40 rounded-md p-4 border border-zinc-700/50">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div
                                                className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-700 to-purple-900 flex items-center justify-center text-purple-300 flex-shrink-0">
                                                <User size={24}/>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span
                                                        className="font-medium text-zinc-200 text-lg">GameDeveloper</span>
                                                    <canvas ref={canvasRef}
                                                            className={`shadow-lg ${getAnimationClass()}`}/>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                    <span>Posts: 1,248</span>
                                                    <span>•</span>
                                                    <span>Joined: Jan 2023</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-zinc-700/50 pt-3 mt-3">
                                            <h4 className="font-medium text-zinc-200 mb-2">New Game Update v2.5 - Patch
                                                Notes</h4>
                                            <p className="text-zinc-400 text-sm">
                                                We&#39;re excited to announce our latest update with new features and
                                                bug
                                                fixes:
                                            </p>
                                            <ul className="list-disc list-inside text-zinc-400 text-sm mt-2 space-y-1">
                                                <li>Added new character customization options</li>
                                                <li>Fixed server stability issues</li>
                                                <li>Improved UI responsiveness</li>
                                            </ul>
                                            <div
                                                className="text-xs text-zinc-500 mt-4 flex items-center justify-between">
                                                <span>Posted: Today at 08:15 AM</span>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1">
                                                        <MessageSquare size={14}/>
                                                        <span>24</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Heart size={14}/>
                                                        <span>142</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {previewMode === "game" && (
                            <div className="relative">
                                <div
                                    className="h-[300px] bg-gradient-to-b from-zinc-800 to-zinc-900 flex items-center justify-center overflow-hidden">
                                    <div
                                        className="absolute inset-0 opacity-20"
                                        style={{
                                            backgroundImage:
                                                "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
                                        }}
                                    ></div>

                                    <div className="relative z-10 flex flex-col items-center">
                                        <div
                                            className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 mb-4 flex items-center justify-center">
                                            <Trophy size={40} className="text-white"/>
                                        </div>

                                        <div
                                            className="bg-zinc-800/80 backdrop-blur-sm px-6 py-3 rounded-lg border border-zinc-700/50 flex items-center gap-3">
                                            <div className="text-center">
                                                <div className="text-zinc-300 font-bold text-xl">Player_One</div>
                                                <div className="flex items-center justify-center mt-1">
                                                    <canvas ref={canvasRef}
                                                            className={`shadow-lg ${getAnimationClass()}`}/>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex items-center gap-4">
                                            <div
                                                className="bg-zinc-800/80 backdrop-blur-sm px-4 py-2 rounded border border-zinc-700/50 flex items-center gap-2">
                                                <Award size={16} className="text-yellow-500"/>
                                                <span className="text-zinc-300 text-sm">Level 42</span>
                                            </div>
                                            <div
                                                className="bg-zinc-800/80 backdrop-blur-sm px-4 py-2 rounded border border-zinc-700/50 flex items-center gap-2">
                                                <Swords size={16} className="text-red-500"/>
                                                <span className="text-zinc-300 text-sm">Battles: 328</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {previewMode === "plain" && (
                            <div className="p-8 flex items-center justify-center">
                                <div className="bg-zinc-800/50 p-6 rounded-md flex flex-col items-center">
                                    <div className="mb-4 text-zinc-400 text-sm">Tag Preview</div>
                                    <canvas ref={canvasRef} className={`shadow-lg ${getAnimationClass()}`}/>
                                    <div className="mt-4 text-zinc-500 text-xs">
                                        {dimensions.width}px × {dimensions.height}px
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-background/40 text-xs">
                                {dimensions.width}×{dimensions.height}px
                            </Badge>
                            <Badge variant="outline" className="bg-background/40 text-xs">
                                {settings.useGradient ? "Gradient" : "Solid"}
                            </Badge>
                            {settings.addBorder && (
                                <Badge variant="outline" className="bg-background/40 text-xs">
                                    Border
                                </Badge>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={createMinecraftJson}
                                            disabled={isLoading}
                                            className="bg-background/40 hover:bg-background/60"
                                        >
                                            {isLoading ? <Loader2 size={16} className="animate-spin"/> :
                                                <FileJson size={16}/>}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Export Minecraft JSON</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            {settings.animation !== "none" ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                            disabled={isLoading || isCreatingGif}
                                        >
                                            {isLoading || isCreatingGif ? (
                                                <>
                                                    <Loader2 size={16} className="animate-spin mr-2"/>
                                                    {isCreatingGif ? `${gifProgress}%` : ""}
                                                </>
                                            ) : (
                                                <Download size={16} className="mr-2"/>
                                            )}
                                            Download
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={handleDownload}>Download as PNG
                                            (Static)</DropdownMenuItem>
                                        <DropdownMenuItem onClick={createAnimatedGif}>Export with Animation
                                            (GIF)</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Button
                                    onClick={handleDownload}
                                    className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 size={16} className="animate-spin mr-2"/>
                                    ) : (
                                        <Download size={16} className="mr-2"/>
                                    )}
                                    Download
                                </Button>
                            )}

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon"
                                            className="bg-background/40 hover:bg-background/60">
                                        <Save size={16}/>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Save Template</DialogTitle>
                                        <DialogDescription>Save your current design as a template for future
                                            use.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="template-name">Template Name</Label>
                                            <Input
                                                id="template-name"
                                                placeholder="My awesome template"
                                                value={templateName}
                                                onChange={(e) => setTemplateName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" onClick={saveTemplate}>
                                            Save Template
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <Card className="w-full border-none shadow-xl bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={handleUndo} disabled={!canUndo}>
                                <Undo size={16}/>
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleRedo} disabled={!canRedo}>
                                <Redo size={16}/>
                            </Button>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <Bookmark size={16}/> Templates
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Saved Templates</DropdownMenuLabel>
                                <DropdownMenuSeparator/>
                                {savedTemplates.length === 0 ? (
                                    <div className="px-2 py-4 text-center text-sm text-muted-foreground">No saved
                                        templates yet</div>
                                ) : (
                                    savedTemplates.map((template) => (
                                        <DropdownMenuItem key={template.id}
                                                          className="flex justify-between items-center">
                                            <button className="flex-1 text-left" onClick={() => loadTemplate(template)}>
                                                {template.name}
                                            </button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    deleteTemplate(template.id, template.name)
                                                }}
                                            >
                                                <Trash2 size={14}/>
                                            </Button>
                                        </DropdownMenuItem>
                                    ))
                                )}
                                <DropdownMenuSeparator/>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" className="w-full justify-start gap-2 h-8">
                                            <BookmarkPlus size={14}/> Save Current Template
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Save Template</DialogTitle>
                                            <DialogDescription>Save your current design as a template for future
                                                use.</DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="template-name-dropdown">Template Name</Label>
                                                <Input
                                                    id="template-name-dropdown"
                                                    placeholder="My awesome template"
                                                    value={templateName}
                                                    onChange={(e) => setTemplateName(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" onClick={saveTemplate}>
                                                Save Template
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid grid-cols-5 mb-6">
                            <TabsTrigger value="basic">Basic</TabsTrigger>
                            <TabsTrigger value="style">Style</TabsTrigger>
                            <TabsTrigger value="effects">Effects</TabsTrigger>
                            <TabsTrigger value="advanced">Advanced</TabsTrigger>
                            <TabsTrigger value="presets">Presets</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="space-y-6">
                            {/* Text */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="text" className="flex items-center gap-2 text-sm mb-2">
                                        <Type size={14}/> Text
                                    </Label>
                                    <Input
                                        id="text"
                                        value={settings.text}
                                        onChange={(e) => updateSetting("text", e.target.value)}
                                        placeholder="Write here"
                                        className="bg-background/50"
                                    />
                                </div>

                                {/* Text Transform */}
                                <div>
                                    <Label htmlFor="textTransform" className="flex items-center gap-2 text-sm mb-2">
                                        <Type size={14}/> Text Transform
                                    </Label>
                                    <Select
                                        value={settings.textTransform}
                                        onValueChange={(value) => updateSetting("textTransform", value)}
                                    >
                                        <SelectTrigger id="textTransform" className="bg-background/50">
                                            <SelectValue placeholder="Select transform"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="uppercase">UPPERCASE</SelectItem>
                                            <SelectItem value="lowercase">lowercase</SelectItem>
                                            <SelectItem value="capitalize">Capitalize</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Text Color and Size */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="textColor" className="flex items-center gap-2 text-sm mb-2">
                                            <Palette size={14}/> Text Color
                                        </Label>
                                        <div className="relative">
                                            <div
                                                className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <div
                                                    className="w-6 h-6 rounded-md border border-border shadow-sm"
                                                    style={{backgroundColor: settings.textColor}}
                                                ></div>
                                            </div>
                                            <div className="flex">
                                                <Input
                                                    id="textColor"
                                                    type="text"
                                                    value={settings.textColor}
                                                    onChange={(e) => updateSetting("textColor", e.target.value)}
                                                    className="h-10 pl-12 pr-24 font-mono text-sm"
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center">
                                                    <Input
                                                        type="color"
                                                        value={settings.textColor}
                                                        onChange={(e) => updateSetting("textColor", e.target.value)}
                                                        className="h-10 w-10 border-0 cursor-pointer"
                                                        style={{padding: 0}}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="fontSize" className="flex items-center gap-2 text-sm mb-2">
                                            <Type size={14}/> Text Size (px)
                                        </Label>
                                        <Input
                                            id="fontSize"
                                            type="number"
                                            value={settings.fontSize}
                                            onChange={(e) => updateSetting("fontSize", Number(e.target.value))}
                                            min={5}
                                            className="bg-background/50"
                                        />
                                    </div>
                                </div>

                                {/* Font Style */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="fontWeight" className="flex items-center gap-2 text-sm mb-2">
                                            <Type size={14}/> Font Weight
                                        </Label>
                                        <Select value={settings.fontWeight}
                                                onValueChange={(value) => updateSetting("fontWeight", value)}>
                                            <SelectTrigger id="fontWeight" className="bg-background/50">
                                                <SelectValue placeholder="Select weight"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="normal">Normal</SelectItem>
                                                <SelectItem value="bold">Bold</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="fontStyle" className="flex items-center gap-2 text-sm mb-2">
                                            <Type size={14}/> Font Style
                                        </Label>
                                        <Select value={settings.fontStyle}
                                                onValueChange={(value) => updateSetting("fontStyle", value)}>
                                            <SelectTrigger id="fontStyle" className="bg-background/50">
                                                <SelectValue placeholder="Select style"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="normal">Normal</SelectItem>
                                                <SelectItem value="italic">Italic</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Icon Upload */}
                                <div>
                                    <Label htmlFor="iconUpload" className="flex items-center gap-2 text-sm mb-2">
                                        <Upload size={14}/> Upload Icon
                                    </Label>
                                    <Input
                                        id="iconUpload"
                                        type="file"
                                        onChange={handleIconUpload}
                                        accept="image/*"
                                        className="bg-background/50"
                                    />
                                </div>

                                {/* Icon Position and Size */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="iconPosition" className="flex items-center gap-2 text-sm mb-2">
                                            <Layout size={14}/> Icon Position
                                        </Label>
                                        <Select
                                            value={settings.iconPosition}
                                            onValueChange={(value) => updateSetting("iconPosition", value)}
                                        >
                                            <SelectTrigger id="iconPosition" className="bg-background/50">
                                                <SelectValue placeholder="Select position"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="left">Left</SelectItem>
                                                <SelectItem value="right">Right</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="iconSize" className="flex items-center gap-2 text-sm mb-2">
                                            <RulerIcon size={14}/> Icon Size (px)
                                        </Label>
                                        <Input
                                            id="iconSize"
                                            type="number"
                                            value={settings.iconSize}
                                            onChange={(e) => updateSetting("iconSize", Number(e.target.value))}
                                            min={10}
                                            className="bg-background/50"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="fontFamily" className="flex items-center gap-2 text-sm mb-2">
                                        <Type size={14}/> Font Family
                                    </Label>
                                    <Select value={settings.fontFamily}
                                            onValueChange={(value) => updateSetting("fontFamily", value)}>
                                        <SelectTrigger id="fontFamily" className="bg-background/50">
                                            <SelectValue placeholder="Select font"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Inter">Inter</SelectItem>
                                            <SelectItem value="Arial">Arial</SelectItem>
                                            <SelectItem value="Verdana">Verdana</SelectItem>
                                            <SelectItem value="Georgia">Georgia</SelectItem>
                                            <SelectItem value="Courier New">Courier New</SelectItem>
                                            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                                            <SelectItem value="Impact">Impact</SelectItem>
                                            <SelectItem value="Minecraft">Minecraft</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="style" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Background Color */}
                                <div>
                                    <Label htmlFor="bgColor" className="flex items-center gap-2 text-sm mb-2">
                                        <Palette size={14}/> Background Color
                                    </Label>
                                    <div className="relative">
                                        <div
                                            className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <div
                                                className="w-6 h-6 rounded-md border border-border shadow-sm"
                                                style={{backgroundColor: settings.bgColor}}
                                            ></div>
                                        </div>
                                        <div className="flex">
                                            <Input
                                                id="bgColor"
                                                type="text"
                                                value={settings.bgColor}
                                                onChange={(e) => updateSetting("bgColor", e.target.value)}
                                                className="h-10 pl-12 pr-24 font-mono text-sm"
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center">
                                                <Input
                                                    type="color"
                                                    value={settings.bgColor}
                                                    onChange={(e) => updateSetting("bgColor", e.target.value)}
                                                    className="h-10 w-10 border-0 cursor-pointer"
                                                    style={{padding: 0}}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Gradient */}
                                <div className="flex flex-col">
                                    <div className="flex items-center justify-between mb-2">
                                        <Label htmlFor="gradientCheckbox" className="flex items-center gap-2 text-sm">
                                            <Sparkles size={14}/> Gradient
                                        </Label>
                                        <Switch
                                            id="gradientCheckbox"
                                            checked={settings.useGradient}
                                            onCheckedChange={(value) => updateSetting("useGradient", value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative">
                                            <div
                                                className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <div
                                                    className="w-6 h-6 rounded-md border border-border shadow-sm"
                                                    style={{backgroundColor: settings.gradientColor}}
                                                ></div>
                                            </div>
                                            <div className="flex">
                                                <Input
                                                    id="gradientColor"
                                                    type="text"
                                                    value={settings.gradientColor}
                                                    onChange={(e) => updateSetting("gradientColor", e.target.value)}
                                                    className="h-10 pl-12 pr-24 font-mono text-sm"
                                                    disabled={!settings.useGradient}
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center">
                                                    <Input
                                                        type="color"
                                                        value={settings.gradientColor}
                                                        onChange={(e) => updateSetting("gradientColor", e.target.value)}
                                                        className="h-10 w-10 border-0 cursor-pointer"
                                                        style={{padding: 0}}
                                                        disabled={!settings.useGradient}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="gradientDirection"
                                                   className="flex items-center gap-2 text-sm">
                                                <ArrowDownUp size={14}/> Vertical
                                            </Label>
                                            <Switch
                                                id="gradientDirection"
                                                checked={settings.gradientDirection}
                                                onCheckedChange={(value) => updateSetting("gradientDirection", value)}
                                                disabled={!settings.useGradient}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Border */}
                                <div className="flex flex-col">
                                    <div className="flex items-center justify-between mb-2">
                                        <Label htmlFor="borderCheckbox" className="flex items-center gap-2 text-sm">
                                            <Layers size={14}/> Border
                                        </Label>
                                        <Switch
                                            id="borderCheckbox"
                                            checked={settings.addBorder}
                                            onCheckedChange={(value) => updateSetting("addBorder", value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative">
                                            <div
                                                className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <div
                                                    className="w-6 h-6 rounded-md border border-border shadow-sm"
                                                    style={{backgroundColor: settings.borderColor}}
                                                ></div>
                                            </div>
                                            <div className="flex">
                                                <Input
                                                    id="borderColor"
                                                    type="text"
                                                    value={settings.borderColor}
                                                    onChange={(e) => updateSetting("borderColor", e.target.value)}
                                                    className="h-10 pl-12 pr-24 font-mono text-sm"
                                                    disabled={!settings.addBorder}
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center">
                                                    <Input
                                                        type="color"
                                                        value={settings.borderColor}
                                                        onChange={(e) => updateSetting("borderColor", e.target.value)}
                                                        className="h-10 w-10 border-0 cursor-pointer"
                                                        style={{padding: 0}}
                                                        disabled={!settings.addBorder}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <Input
                                                id="borderWidth"
                                                type="number"
                                                value={settings.borderWidth}
                                                onChange={(e) => updateSetting("borderWidth", Number(e.target.value))}
                                                min={0}
                                                className="bg-background/50"
                                                disabled={!settings.addBorder}
                                                placeholder="Border width"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Corner Radius */}
                                <div>
                                    <Label htmlFor="cornerRadius"
                                           className="flex items-center justify-between text-sm mb-2">
                                        <div className="flex items-center gap-2">
                                            <RulerIcon size={14}/> Corner Radius
                                        </div>
                                        <span className="text-muted-foreground">{settings.cornerRadius}%</span>
                                    </Label>
                                    <Slider
                                        id="cornerRadius"
                                        value={[settings.cornerRadius]}
                                        onValueChange={(value) => updateSetting("cornerRadius", value[0])}
                                        min={0}
                                        max={50}
                                        step={1}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Image Height */}
                                <div>
                                    <Label htmlFor="imageHeight" className="flex items-center gap-2 text-sm mb-2">
                                        <RulerIcon size={14}/> Image Height (px)
                                    </Label>
                                    <Input
                                        id="imageHeight"
                                        type="number"
                                        value={settings.imageHeight}
                                        onChange={(e) => updateSetting("imageHeight", Number(e.target.value))}
                                        min={10}
                                        className="bg-background/50"
                                    />
                                </div>

                                {/* Padding */}
                                <div>
                                    <Label htmlFor="padding" className="flex items-center gap-2 text-sm mb-2">
                                        <RulerIcon size={14}/> Image Padding (px)
                                    </Label>
                                    <Input
                                        id="padding"
                                        type="number"
                                        value={settings.padding}
                                        onChange={(e) => updateSetting("padding", Number(e.target.value))}
                                        min={0}
                                        className="bg-background/50"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="tagShape" className="flex items-center gap-2 text-sm mb-2">
                                        <Layout size={14}/> Tag Shape
                                    </Label>
                                    <Select
                                        value={settings.tagShape}
                                        onValueChange={(value: "rectangle" | "pill" | "hexagon" | "diamond") =>
                                            updateSetting("tagShape", value)
                                        }
                                    >
                                        <SelectTrigger id="tagShape" className="bg-background/50">
                                            <SelectValue placeholder="Select shape"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="rectangle">Rectangle</SelectItem>
                                            <SelectItem value="pill">Pill</SelectItem>
                                            <SelectItem value="hexagon">Hexagon</SelectItem>
                                            <SelectItem value="diamond">Diamond</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="backgroundPattern" className="flex items-center gap-2 text-sm mb-2">
                                        <Layout size={14}/> Background Pattern
                                    </Label>
                                    <Select
                                        value={settings.backgroundPattern}
                                        onValueChange={(value) => updateSetting("backgroundPattern", value)}
                                    >
                                        <SelectTrigger id="backgroundPattern" className="bg-background/50">
                                            <SelectValue placeholder="Select pattern"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="dots">Dots</SelectItem>
                                            <SelectItem value="lines">Lines</SelectItem>
                                            <SelectItem value="grid">Grid</SelectItem>
                                            <SelectItem value="diagonal">Diagonal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="effects" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Shadow */}
                                <div className="flex flex-col">
                                    <div className="flex items-center justify-between mb-2">
                                        <Label htmlFor="shadowCheckbox" className="flex items-center gap-2 text-sm">
                                            <Layers size={14}/> Shadow
                                        </Label>
                                        <Switch
                                            id="shadowCheckbox"
                                            checked={settings.shadow}
                                            onCheckedChange={(value) => updateSetting("shadow", value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative">
                                            <Label htmlFor="shadowColor"
                                                   className="text-xs text-muted-foreground mb-1 block">
                                                Shadow Color
                                            </Label>
                                            <div className="flex items-center">
                                                <div
                                                    className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <div
                                                        className="w-6 h-6 rounded-md border border-border shadow-sm"
                                                        style={{
                                                            backgroundColor: settings.shadowColor.startsWith("rgba")
                                                                ? `rgba(${settings.shadowColor.match(/rgba$$(\d+),\s*(\d+),\s*(\d+),\s*[\d.]+$$/)?.[1]}, 
                                                           ${settings.shadowColor.match(/rgba$$(\d+),\s*(\d+),\s*(\d+),\s*[\d.]+$$/)?.[2]}, 
                                                           ${settings.shadowColor.match(/rgba$$(\d+),\s*(\d+),\s*(\d+),\s*[\d.]+$$/)?.[3]}, 1)`
                                                                : settings.shadowColor,
                                                        }}
                                                    ></div>
                                                </div>
                                                <div className="flex w-full">
                                                    <Input
                                                        id="shadowColor"
                                                        type="text"
                                                        value={settings.shadowColor}
                                                        onChange={(e) => updateSetting("shadowColor", e.target.value)}
                                                        className="h-10 pl-12 pr-24 font-mono text-sm"
                                                        disabled={!settings.shadow}
                                                    />
                                                    <div className="absolute inset-y-0 right-0 flex items-center">
                                                        <Input
                                                            type="color"
                                                            value={
                                                                settings.shadowColor.startsWith("rgba")
                                                                    ? `#${Number.parseInt(
                                                                        settings.shadowColor.match(/rgba$$(\d+),\s*(\d+),\s*(\d+),\s*[\d.]+$$/)?.[1] ||
                                                                        "0",
                                                                    )
                                                                        .toString(16)
                                                                        .padStart(2, "0")}${Number.parseInt(
                                                                        settings.shadowColor.match(/rgba$$(\d+),\s*(\d+),\s*(\d+),\s*[\d.]+$$/)?.[2] ||
                                                                        "0",
                                                                    )
                                                                        .toString(16)
                                                                        .padStart(2, "0")}${Number.parseInt(
                                                                        settings.shadowColor.match(/rgba$$(\d+),\s*(\d+),\s*(\d+),\s*[\d.]+$$/)?.[3] ||
                                                                        "0",
                                                                    )
                                                                        .toString(16)
                                                                        .padStart(2, "0")}`
                                                                    : settings.shadowColor
                                                            }
                                                            onChange={(e) => {
                                                                const hex = e.target.value
                                                                const r = Number.parseInt(hex.slice(1, 3), 16)
                                                                const g = Number.parseInt(hex.slice(3, 5), 16)
                                                                const b = Number.parseInt(hex.slice(5, 7), 16)
                                                                updateSetting("shadowColor", `rgba(${r},${g},${b},0.5)`)
                                                            }}
                                                            className="h-10 w-10 border-0 cursor-pointer"
                                                            style={{padding: 0}}
                                                            disabled={!settings.shadow}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="shadowBlur"
                                                   className="text-xs text-muted-foreground mb-1 block">
                                                Blur: {settings.shadowBlur}px
                                            </Label>
                                            <Slider
                                                id="shadowBlur"
                                                value={[settings.shadowBlur]}
                                                onValueChange={(value) => updateSetting("shadowBlur", value[0])}
                                                min={0}
                                                max={20}
                                                step={1}
                                                disabled={!settings.shadow}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <Label htmlFor="shadowOffsetX"
                                                   className="text-xs text-muted-foreground mb-1 block">
                                                Offset X: {settings.shadowOffsetX}px
                                            </Label>
                                            <Slider
                                                id="shadowOffsetX"
                                                value={[settings.shadowOffsetX]}
                                                onValueChange={(value) => updateSetting("shadowOffsetX", value[0])}
                                                min={-10}
                                                max={10}
                                                step={1}
                                                disabled={!settings.shadow}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="shadowOffsetY"
                                                   className="text-xs text-muted-foreground mb-1 block">
                                                Offset Y: {settings.shadowOffsetY}px
                                            </Label>
                                            <Slider
                                                id="shadowOffsetY"
                                                value={[settings.shadowOffsetY]}
                                                onValueChange={(value) => updateSetting("shadowOffsetY", value[0])}
                                                min={-10}
                                                max={10}
                                                step={1}
                                                disabled={!settings.shadow}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-accent/30 rounded-lg p-4">
                                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                                        <Sparkles size={16}/> Effect Tips
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Shadows can add depth and make your tag stand out. Try combining shadows with
                                        gradients for a more
                                        professional look.
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-auto py-1 text-xs"
                                            onClick={() => {
                                                updateSetting("shadow", true)
                                                updateSetting("shadowColor", "rgba(0,0,0,0.5)")
                                                updateSetting("shadowBlur", 4)
                                                updateSetting("shadowOffsetX", 2)
                                                updateSetting("shadowOffsetY", 2)
                                            }}
                                        >
                                            Apply Classic Shadow
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-auto py-1 text-xs"
                                            onClick={() => {
                                                updateSetting("shadow", true)
                                                updateSetting("shadowColor", "rgba(124,58,237,0.5)")
                                                updateSetting("shadowBlur", 8)
                                                updateSetting("shadowOffsetX", 0)
                                                updateSetting("shadowOffsetY", 0)
                                            }}
                                        >
                                            Apply Glow Effect
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="advanced" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Text Alignment */}
                                <div>
                                    <Label htmlFor="textAlign" className="flex items-center gap-2 text-sm mb-2">
                                        <Type size={14}/> Text Alignment
                                    </Label>
                                    <Select
                                        value={settings.textAlign}
                                        onValueChange={(value: "left" | "center" | "right") => updateSetting("textAlign", value)}
                                    >
                                        <SelectTrigger id="textAlign" className="bg-background/50">
                                            <SelectValue placeholder="Select alignment"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="left">Left</SelectItem>
                                            <SelectItem value="center">Center</SelectItem>
                                            <SelectItem value="right">Right</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Letter Spacing */}
                                <div>
                                    <Label htmlFor="letterSpacing"
                                           className="flex items-center justify-between text-sm mb-2">
                                        <div className="flex items-center gap-2">
                                            <Type size={14}/> Letter Spacing
                                        </div>
                                        <span className="text-muted-foreground">{settings.letterSpacing}</span>
                                    </Label>
                                    <Slider
                                        id="letterSpacing"
                                        value={[settings.letterSpacing]}
                                        onValueChange={(value) => updateSetting("letterSpacing", value[0])}
                                        min={0}
                                        max={10}
                                        step={1}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Animation */}
                                <div>
                                    <Label htmlFor="animation" className="flex items-center gap-2 text-sm mb-2">
                                        <Sparkles size={14}/> Animation Effect
                                    </Label>
                                    <Select
                                        value={settings.animation}
                                        onValueChange={(value: "none" | "pulse" | "bounce" | "shake" | "glow") =>
                                            updateSetting("animation", value)
                                        }
                                    >
                                        <SelectTrigger id="animation" className="bg-background/50">
                                            <SelectValue placeholder="Select animation"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="pulse">Pulse</SelectItem>
                                            <SelectItem value="bounce">Bounce</SelectItem>
                                            <SelectItem value="shake">Shake</SelectItem>
                                            <SelectItem value="glow">Glow</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="bg-accent/30 rounded-lg p-4">
                                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                                        <Sparkles size={16}/> Advanced Tips
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Animations can make your tag stand out in dynamic environments. Letter spacing
                                        can improve
                                        readability for certain fonts and styles.
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-auto py-1 text-xs"
                                            onClick={() => {
                                                updateSetting("animation", "glow")
                                                updateSetting("shadow", true)
                                                updateSetting("shadowColor", "rgba(124,58,237,0.5)")
                                                updateSetting("shadowBlur", 8)
                                            }}
                                        >
                                            Apply Glow Animation
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-auto py-1 text-xs"
                                            onClick={() => {
                                                updateSetting("letterSpacing", 3)
                                                updateSetting("textTransform", "uppercase")
                                            }}
                                        >
                                            Apply Spaced Text
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="presets" className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                {presets.map((preset, index) => (
                                    <div
                                        key={index}
                                        className="border border-border rounded-lg p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                                        onClick={() => applyPreset(preset)}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div
                                                className="w-8 h-8 rounded-md"
                                                style={{
                                                    background: preset.useGradient
                                                        ? `linear-gradient(to right, ${preset.bgColor}, ${preset.gradientColor})`
                                                        : preset.bgColor,
                                                    border: preset.addBorder ? `2px solid ${preset.borderColor}` : "none",
                                                    boxShadow: preset.shadow ? `0 0 8px ${preset.shadowColor || "rgba(0,0,0,0.5)"}` : "none",
                                                }}
                                            />
                                            <h3 className="font-medium">{preset.name}</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline" className="text-xs bg-background/40">
                                                {preset.useGradient ? "Gradient" : "Solid"}
                                            </Badge>
                                            {preset.addBorder && (
                                                <Badge variant="outline" className="text-xs bg-background/40">
                                                    Border
                                                </Badge>
                                            )}
                                            {preset.shadow && (
                                                <Badge variant="outline" className="text-xs bg-background/40">
                                                    Shadow
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-accent/30 rounded-lg p-4 mt-4">
                                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <Sparkles size={16}/> Pro Tip
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Click on any preset to instantly apply its colors and settings to your RankTag. You
                                    can still
                                    customize individual settings after applying a preset.
                                </p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <Dialog open={showJsonDialog} onOpenChange={setShowJsonDialog}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Minecraft Resource Pack JSON</DialogTitle>
                        <DialogDescription>
                            Hier ist der JSON-Code für dein Minecraft Resource Pack. Du kannst ihn kopieren oder
                            herunterladen.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-zinc-900 p-4 rounded-md overflow-auto max-h-[400px]">
                        <pre className="text-zinc-300 text-sm whitespace-pre-wrap">{jsonContent}</pre>
                    </div>
                    <DialogFooter className="flex justify-between items-center">
                        <Button
                            variant="outline"
                            onClick={() => {
                                navigator.clipboard.writeText(jsonContent)
                                toast({
                                    title: "Copied!",
                                    description: "JSON copied to clipboard",
                                })
                            }}
                        >
                            <Download size={16} className="mr-2"/> Copy to Clipboard
                        </Button>
                        <Button onClick={downloadMinecraftJson}>
                            <Download size={16} className="mr-2"/> Download JSON
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Animation Info Dialog */}
            <Dialog open={showAnimationDialog} onOpenChange={setShowAnimationDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Animation Export</DialogTitle>
                        <DialogDescription>Dein RankTag wurde mit Animation exportiert!</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <p className="text-sm">Die Animation wurde als GIF exportiert und sollte jetzt heruntergeladen
                            werden.</p>
                        <div
                            className="bg-green-500/10 border border-green-500/20 rounded-md p-3 text-green-200 text-sm">
                            <p className="flex items-start">
                                <span className="mr-2 mt-0.5">✓</span>
                                <span>
                  Die Animation wurde erfolgreich als GIF exportiert und kann jetzt in deinen Anwendungen verwendet
                  werden.
                </span>
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setShowAnimationDialog(false)}>Verstanden</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Toaster/>
        </div>
    )
}

