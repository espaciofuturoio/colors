'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

type RGB = [number, number, number]

const colorMap: { [key: string]: RGB } = {
    rojo: [255, 0, 0],
    azul: [0, 0, 255],
    amarillo: [255, 255, 0],
    verde: [0, 255, 0],
    naranja: [255, 165, 0],
    violeta: [238, 130, 238],
    amarilloVerde: [154, 205, 50],
    amarilloNaranja: [255, 215, 0],
    rojoNaranja: [255, 69, 0],
    rojoVioleta: [199, 21, 133],
    azulVioleta: [138, 43, 226],
    azulVerde: [0, 206, 209],
}

const colorMixes: { [key: string]: [string, string] } = {
    verde: ["amarillo", "azul"],
    naranja: ["amarillo", "rojo"],
    violeta: ["azul", "rojo"],
    amarilloVerde: ["amarillo", "verde"],
    amarilloNaranja: ["amarillo", "naranja"],
    rojoNaranja: ["rojo", "naranja"],
    rojoVioleta: ["rojo", "violeta"],
    azulVioleta: ["azul", "violeta"],
    azulVerde: ["azul", "verde"],
}

const rgbToHex = (r: number, g: number, b: number) =>
    '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')

const ColorCircle = ({ color, isAnimating, isMixing, position, mixedColor }: { color: RGB; isAnimating: boolean; isMixing: boolean; position: 'left' | 'right'; mixedColor: RGB }) => (
    <motion.div
        className={`w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full shadow-lg absolute ${position === 'left' ? 'left-0' : 'right-0'}`}
        style={{
            backgroundColor: isMixing ? rgbToHex(...mixedColor) : rgbToHex(...color),
            opacity: isMixing ? 0.7 : 1 // Añadir efecto translúcido
        }}
        animate={
            isAnimating
                ? {
                    x: position === 'left' ? [0, 50, 0] : [0, -50, 0],
                    opacity: isMixing ? [1, 0.7, 1] : 1 // Interpolar opacidad durante la mezcla
                }
                : {}
        }
        transition={{ duration: 2, ease: "easeInOut" }}
    />
)

const GooeyContainer = ({ children, mixedColor }: { children: React.ReactNode, mixedColor: RGB }) => (
    <div className="relative w-64 h-32 sm:w-80 sm:h-40 md:w-96 md:h-48 filter gooey">
        {children}
        <motion.div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: rgbToHex(...mixedColor), opacity: 0.5 }} // Mostrar color resultante
            animate={{ opacity: [0, 0.5, 0] }} // Animar opacidad para mostrar el color resultante
            transition={{ duration: 2, ease: "easeInOut" }}
        />
    </div>
)

const OptionsContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8" style={{ minHeight: '100px' }}>
        {children}
    </div>
)

const FeedbackMessage = ({ feedback }: { feedback: string }) => (
    <motion.p
        className="text-center text-2xl mb-6"
        style={{ color: feedback.includes('Correcto') ? 'green' : 'orange', minHeight: '40px' }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
    >
        {feedback}
    </motion.p>
)

export const GooeyColorMixingGame = () => {
    const [color1, setColor1] = useState<RGB>([0, 0, 0])
    const [color2, setColor2] = useState<RGB>([0, 0, 0])
    const [color1Name, setColor1Name] = useState('')
    const [color2Name, setColor2Name] = useState('')
    const [targetColorName, setTargetColorName] = useState('')
    const [options, setOptions] = useState<string[]>([])
    const [score, setScore] = useState(0)
    const [feedback, setFeedback] = useState('')
    const [isAnimating, setIsAnimating] = useState(false)
    const [isMixing, setIsMixing] = useState(false)
    const [mixedColor, setMixedColor] = useState<RGB>([0, 0, 0])

    const generateNewRound = () => {
        const secondaryOrTertiaryColors = Object.keys(colorMixes)
        const newTargetColorName = secondaryOrTertiaryColors[Math.floor(Math.random() * secondaryOrTertiaryColors.length)]
        const correctMix = colorMixes[newTargetColorName]

        if (correctMix) {
            setColor1(colorMap[correctMix[0]])
            setColor2(colorMap[correctMix[1]])
            setColor1Name(correctMix[0])
            setColor2Name(correctMix[1])
            setTargetColorName(newTargetColorName)
            setMixedColor(colorMap[newTargetColorName])

            const newOptions = [newTargetColorName]
            while (newOptions.length < 3) {
                const randomColor = secondaryOrTertiaryColors[Math.floor(Math.random() * secondaryOrTertiaryColors.length)]
                if (!newOptions.includes(randomColor)) {
                    newOptions.push(randomColor)
                }
            }
            setOptions(newOptions.sort(() => Math.random() - 0.5))
            setFeedback('')
            setIsAnimating(false)
            setIsMixing(false)
        }
    }

    useEffect(() => {
        generateNewRound()
    }, [])

    const handleGuess = (guessedColor: string) => {
        if (guessedColor === targetColorName) {
            setScore(score + 1)
            setFeedback('¡Correcto! ¡Has acertado el color! 🎉')
        } else {
            setFeedback(`¡Casi! La mezcla correcta era ${targetColorName}. Inténtalo de nuevo. 😊`)
        }
        setIsAnimating(true)
        setTimeout(() => setIsMixing(true), 1000)
        setTimeout(() => {
            setIsAnimating(false)
            setIsMixing(false)
            generateNewRound()
        }, 6000)
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-200 to-pink-200 flex items-center justify-center p-2 sm:p-4">
            <Card className="w-full max-w-xl sm:max-w-2xl p-4 sm:p-8 bg-white rounded-3xl shadow-2xl">
                <motion.h1
                    className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 sm:mb-8 text-purple-600"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    ¡Mezcla de Colores!
                </motion.h1>
                <div className="flex justify-center items-center mb-4 sm:mb-8">
                    <GooeyContainer mixedColor={mixedColor}>
                        <ColorCircle color={color1} isAnimating={isAnimating} isMixing={isMixing} position="left" mixedColor={mixedColor} />
                        <ColorCircle color={color2} isAnimating={isAnimating} isMixing={isMixing} position="right" mixedColor={mixedColor} />
                    </GooeyContainer>
                </div>
                <motion.p
                    className="text-xl sm:text-2xl md:text-3xl text-center mb-4 sm:mb-6 text-gray-700"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    {!isAnimating ? `¿Qué color obtienes al mezclar ${color1Name} y ${color2Name}?` : "¡Mira cómo se mezclan los colores!"}
                </motion.p>
                <AnimatePresence>
                    {!isAnimating && (
                        <OptionsContainer>
                            {options.map((colorName, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 50, opacity: 0 }}
                                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                                >
                                    <Button
                                        className="w-full h-20 text-2xl font-bold rounded-xl shadow-md transition-transform hover:scale-105"
                                        onClick={() => handleGuess(colorName)}
                                        style={{ backgroundColor: rgbToHex(...colorMap[colorName]) }}
                                    >
                                        {/* {colorName.charAt(0).toUpperCase() + colorName.slice(1)} */}
                                    </Button>
                                </motion.div>
                            ))}
                        </OptionsContainer>
                    )}
                </AnimatePresence>
                <FeedbackMessage feedback={feedback} />
                <motion.p
                    className="text-center text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-purple-600"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                >
                    Puntuación: {score}
                </motion.p>
                {!isAnimating && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        transition={{ duration: 0.5, delay: 1 }}
                    >
                        <Button className="w-full h-16 text-2xl font-bold rounded-xl bg-green-500 hover:bg-green-600 transition-colors" onClick={generateNewRound}>
                            Nuevos Colores
                        </Button>
                    </motion.div>
                )}
            </Card>

            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <filter id="gooey">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="gooey" />
                        <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
                    </filter>
                </defs>
            </svg>

            <style jsx>{`
        .gooey {
          filter: url('#gooey');
        }
      `}</style>
        </div>
    )
}