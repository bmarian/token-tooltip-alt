import Tooltip from "./Tooltip";

class TooltipFactory {
    private static _instance: TooltipFactory;
    private tooltips: Array<Tooltip> = [];

    private constructor() {
    }

    public static getInstance(): TooltipFactory {
        if (!TooltipFactory._instance) TooltipFactory._instance = new TooltipFactory();
        return TooltipFactory._instance;
    }

    public async hoverToken(token: any, isHovering: boolean): Promise<void> {
    }

    public removeTooltips(): void {
    }
}

export default TooltipFactory.getInstance();