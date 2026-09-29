import fs from "fs";
import { select } from '@inquirer/prompts';

export class TargetSelector {
    constructor(
        private readonly workingDirectory: string = process.cwd()
    ) {}

    async select(): Promise<string> {
        const targets =
            fs.readdirSync(this.workingDirectory)
                .filter(
                    file => file.startsWith('.env.')
                );

        return await select({
            message: 'Select deployment target',
            choices: targets.map(
                target => ({
                    name: target.replace('.env.', ''),
                    value: target
                })
            )
        });
    }
}

const targetSelector = new TargetSelector();

export async function selectTarget(): Promise<string> {
    return targetSelector.select();
}
