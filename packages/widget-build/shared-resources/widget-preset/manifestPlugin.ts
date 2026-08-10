import { createHash } from 'crypto'
import fs from 'fs'
import path from 'path'

type Options = {
    widgetName: string,
    version: string
}

export function manifestPlugin<TPlugin>({
    widgetName,
    version
}: Options): TPlugin {
    if (!widgetName) {
        throw new Error('manifestPlugin requires widgetName')
    }

    return {
        name: 'reactedge-manifest-plugin',
        apply: 'build',

        generateBundle(options, bundle) {
            const entries = Object.entries(bundle).filter(
                ([fileName, chunk]) =>
                    chunk.type === 'chunk' && fileName.endsWith('.iife.js')
            )

            if (entries.length !== 1) {
                throw new Error(
                    `Expected exactly one IIFE bundle, found ${entries.length}`
                )
            }

            const [fileName, chunk] = entries[0]

            const hash = createHash('sha256')
                .update(chunk.code)
                .digest('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '')

            const newFileName = `widget-${widgetName}@${hash}.iife.js`
            const cssFilename = `widget-${widgetName}.css`

            bundle[newFileName] = {
                ...chunk,
                fileName: newFileName
            }
            delete bundle[fileName]

            const manifest = {
                widget: widgetName,
                version,
                hash,
                cssFilename,
                filename: newFileName,
                built_at: new Date().toISOString()
            }

            const outDir = options.dir || 'www'

            const manifestPath = path.join(
                outDir,
                `widget-${widgetName}.manifest.json`
            )

            fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))

            // eslint-disable-next-line no-console
            console.log(`✔ Manifest generated: ${manifestPath}`)
        }
    } as TPlugin
}