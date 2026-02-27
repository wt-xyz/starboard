#!/usr/bin/env node

import { readdir, readFile, writeFile } from "fs/promises"
import { join } from "path"

const typesDir = new URL("../types", import.meta.url).pathname
const fuelScriptTypesDir = new URL("../fuel-script-types", import.meta.url).pathname

async function fixImportsInDir(dir) {
    const files = await readdir(dir)

    for (const file of files) {
        if (!file.endsWith(".ts")) continue

        const filePath = join(dir, file)
        let content = await readFile(filePath, "utf-8")

        // Add .js extension to relative imports
        content = content.replace(/from ['"](\.\/.+?)(?<!\.js)['"]/g, 'from "$1.js"')

        await writeFile(filePath, content, "utf-8")
    }
}

async function fixImports() {
    await fixImportsInDir(typesDir)
    await fixImportsInDir(fuelScriptTypesDir)

    console.log("✓ Fixed imports in generated types")
}

fixImports().catch(console.error)
