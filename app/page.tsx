import RankTagGenerator from "@/components/rank-tag-generator"

export default function Home() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-background via-background/95 to-purple-950/10 py-10 px-4">
            <div className="container mx-auto max-w-5xl">
                <div className="mb-12 text-center">
                    <div
                        className="inline-block mb-3 px-4 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium">
                        Pro Design Tool
                    </div>
                    <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600">
                        RankTag Generator
                    </h1>
                    <p className="text-center text-muted-foreground max-w-2xl mx-auto text-lg">
                        Create stunning custom rank tags for your community, game, or platform with our professional
                        design tool.
                        Customize every aspect and export in seconds.
                    </p>
                </div>
                <RankTagGenerator/>
            </div>
        </main>
    )
}

