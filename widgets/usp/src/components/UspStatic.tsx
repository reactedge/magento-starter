import {Fragment} from "react";
import { UspSlide } from "./UspSlide.tsx";
import type { UspStaticProps } from "./Types.ts";
import {SlideSeparator} from "./SlideSeparator.tsx";

export function UspStatic({ slides, config }: UspStaticProps) {
    return (
        <section className={`usp-static-bar ${config.theme || 'light'}`}>
            {slides.map((slide, index) => (
                <Fragment key={index}>
                    <UspSlide slide={slide} isActive={false} tileMode={true} />
                    {index < slides.length - 1 && <SlideSeparator />}
                </Fragment>
            ))}
        </section>
    );
}
