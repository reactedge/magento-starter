import type { UspSlideProps } from "./Types";

export const UspSlide = ({ slide, isActive }: UspSlideProps) => {
    const { text, heading } = slide;

    return (
        <div data-usp-slide
             data-usp-active={isActive || undefined}
        >
            {heading && <h3 className="usp-slide__heading">{heading}</h3>}
            <p className="usp-slide__text">
                {text}
            </p>
        </div>
    );

};