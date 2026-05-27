export const THEMES = [
    { id: "none", label: "No Theme", preview: "bg-[#18181b]", bgImage: null },
    { id: "overworld", label: "Overworld", preview: "bg-gradient-to-b from-sky-400 to-green-500", bgImage: "linear-gradient(180deg, #38bdf8 0%, #22c55e 100%)" },
    { id: "nether", label: "Nether", preview: "bg-gradient-to-b from-red-900 to-orange-600", bgImage: "linear-gradient(180deg, #7f1d1d 0%, #ea580c 100%)" },
    { id: "end", label: "The End", preview: "bg-gradient-to-b from-purple-900 to-indigo-950", bgImage: "linear-gradient(180deg, #581c87 0%, #1e1b4b 100%)" },
    { id: "ocean", label: "Deep Ocean", preview: "bg-gradient-to-b from-blue-900 to-cyan-800", bgImage: "linear-gradient(180deg, #1e3a5f 0%, #155e75 100%)" },
    { id: "mesa", label: "Mesa", preview: "bg-gradient-to-b from-orange-800 to-yellow-700", bgImage: "linear-gradient(180deg, #9a3412 0%, #a16207 100%)" },
] as const;

export const getCombinedThemes = (apiThemes: string[] | undefined) => {
    return [
        ...THEMES,
        ...(apiThemes || []).map(filename => ({
            id: filename,
            label: filename.replace(".png", "").replace(/_/g, " "),
            preview: "",
            previewImage: `url('/assets/minecraft/backgrounds/${filename}')`,
            bgImage: `url('/assets/minecraft/backgrounds/${filename}')`,
        }))
    ];
};
