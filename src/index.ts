import {
    Plugin,
    showMessage,
    Menu,
    getFrontend,
    getBackend,
    IModel,
} from "siyuan";
import "@/index.scss";

import HelloExample from "@/hello.svelte";

import { SettingUtils } from "./libs/setting-utils";

const STORAGE_NAME = "menu-config";
const TAB_TYPE = "custom_tab";
export default class PluginSample extends Plugin {

    customTab: () => IModel;
    private isMobile: boolean;
    private AutoDesktopModeSetting: SettingUtils;

    async onload() {
        const frontEnd = getFrontend();
        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";
        // 图标的制作参见帮助文档
        this.addIcons(`<symbol id="iconFace" viewBox="0 0 32 32">
<path d="M13.667 17.333c0 0.92-0.747 1.667-1.667 1.667s-1.667-0.747-1.667-1.667 0.747-1.667 1.667-1.667 1.667 0.747 1.667 1.667zM20 15.667c-0.92 0-1.667 0.747-1.667 1.667s0.747 1.667 1.667 1.667 1.667-0.747 1.667-1.667-0.747-1.667-1.667-1.667zM29.333 16c0 7.36-5.973 13.333-13.333 13.333s-13.333-5.973-13.333-13.333 5.973-13.333 13.333-13.333 13.333 5.973 13.333 13.333zM14.213 5.493c1.867 3.093 5.253 5.173 9.12 5.173 0.613 0 1.213-0.067 1.787-0.16-1.867-3.093-5.253-5.173-9.12-5.173-0.613 0-1.213 0.067-1.787 0.16zM5.893 12.627c2.28-1.293 4.040-3.4 4.88-5.92-2.28 1.293-4.040 3.4-4.88 5.92zM26.667 16c0-1.040-0.16-2.040-0.44-2.987-0.933 0.2-1.893 0.32-2.893 0.32-4.173 0-7.893-1.92-10.347-4.92-1.4 3.413-4.187 6.093-7.653 7.4 0.013 0.053 0 0.12 0 0.187 0 5.88 4.787 10.667 10.667 10.667s10.667-4.787 10.667-10.667z"></path>
</symbol>
<symbol id="iconSaving" viewBox="0 0 32 32">
<path d="M20 13.333c0-0.733 0.6-1.333 1.333-1.333s1.333 0.6 1.333 1.333c0 0.733-0.6 1.333-1.333 1.333s-1.333-0.6-1.333-1.333zM10.667 12h6.667v-2.667h-6.667v2.667zM29.333 10v9.293l-3.76 1.253-2.24 7.453h-7.333v-2.667h-2.667v2.667h-7.333c0 0-3.333-11.28-3.333-15.333s3.28-7.333 7.333-7.333h6.667c1.213-1.613 3.147-2.667 5.333-2.667 1.107 0 2 0.893 2 2 0 0.28-0.053 0.533-0.16 0.773-0.187 0.453-0.347 0.973-0.427 1.533l3.027 3.027h2.893zM26.667 12.667h-1.333l-4.667-4.667c0-0.867 0.12-1.72 0.347-2.547-1.293 0.333-2.347 1.293-2.787 2.547h-8.227c-2.573 0-4.667 2.093-4.667 4.667 0 2.507 1.627 8.867 2.68 12.667h2.653v-2.667h8v2.667h2.68l2.067-6.867 3.253-1.093v-4.707z"></path>
</symbol>`);

        const topBarElement = this.addTopBar({
            icon: "iconFace",
            title: this.i18n.addTopBarIcon,
            position: "right",
            callback: () => {
                if (this.isMobile) {
                    this.addMenu();
                } else {
                    let rect = topBarElement.getBoundingClientRect();
                    // 如果被隐藏，则使用更多按钮
                    if (rect.width === 0) {
                        rect = document.querySelector("#barMore").getBoundingClientRect();
                    }
                    if (rect.width === 0) {
                        rect = document.querySelector("#barPlugins").getBoundingClientRect();
                    }
                    this.addMenu(rect);
                }
            }
        });

        this.AutoDesktopModeSetting = new SettingUtils({
            plugin: this, name: STORAGE_NAME
        });
        this.AutoDesktopModeSetting.addItem({
            key: "Check",
            value: true,
            type: "checkbox",
            title: this.i18n.automodeswitch,
            description: this.i18n.automodeswitchdescription,
            action: {
                callback: () => {
                    // Return data and save it in real time
                    let value = !this.AutoDesktopModeSetting.get("Check");
                    this.AutoDesktopModeSetting.set("Check", value);
                    console.log(value);
                }
            }
        });

        try {
            await this.AutoDesktopModeSetting.load();
            // 加载完成后，获取并检查值
            const value = this.AutoDesktopModeSetting.get("Check");
            console.log("check:", value);
            if (value) {
                this.checkAndRedirectLoction();
            }
        } catch (error) {
            console.error("Error loading settings storage, probably empty config json:", error);
        }

        console.log(this.i18n.helloPlugin);
    }

    onLayoutReady() {
        // this.loadData(STORAGE_NAME);
        this.AutoDesktopModeSetting.load();
        console.log(`frontend: ${getFrontend()}; backend: ${getBackend()}`);

        let tabDiv = document.createElement("div");
        new HelloExample({
            target: tabDiv,
            props: {
                app: this.app,
            }
        });
        this.customTab = this.addTab({
            type: TAB_TYPE,
            init() {
                this.element.appendChild(tabDiv);
                console.log(this.element);
            },
            beforeDestroy() {
                console.log("before destroy tab:", TAB_TYPE);
            },
            destroy() {
                console.log("destroy tab:", TAB_TYPE);
            }
        });
    }

    async onunload() {
        console.log(this.i18n.byePlugin);
        showMessage("Goodbye SiYuan Plugin");
        console.log("onunload");
        this.checkAndRedirectLoction();
    }

    uninstall() {
        console.log("uninstall");
    }

    private checkAndRedirectLoction() {
        const DESKTOP_LOCATION = `${window.location.origin}${"/stage/build/desktop/"}`;
        if (window.location.href.includes("/stage/build/mobile/")) {
            console.log("重定向到新的 Location:", DESKTOP_LOCATION);
            window.location.href = DESKTOP_LOCATION;
        } else {
            console.log("当前 Location 已为桌面模式，无需重定向。");
        }
    }

    private BiRedirectLoction() {
        const DESKTOP_LOCATION = `${window.location.origin}${"/stage/build/desktop/"}`;
        const MOBILE_LOCATION = `${window.location.origin}${"/stage/build/mobile/"}`;
        if (window.location.href.includes("/stage/build/mobile/")) {
            console.log("重定向到新的 Location:", DESKTOP_LOCATION);
            window.location.href = DESKTOP_LOCATION;
        } else {
            console.log("重定向到新的 Location:", MOBILE_LOCATION);
            window.location.href = MOBILE_LOCATION;
        }
    }

    private addMenu(rect?: DOMRect) {
        const menu = new Menu("topBarSample", () => {
            console.log(this.i18n.byeMenu);
        });
        menu.addItem({
            icon: "iconInfo",
            label: this.i18n.modeswitch,
            click: () => {
                this.BiRedirectLoction();
            }
        });
        if (this.isMobile) {
            menu.fullscreen();
        } else {
            menu.open({
                x: rect.right,
                y: rect.bottom,
                isLeft: true,
            });
        }
    }
}
