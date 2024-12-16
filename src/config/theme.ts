import {
    MantineThemeOverride,
    Table,
    Modal,
    NumberInput,
    Switch,
    TextInput,
    Stepper,
    Checkbox,
    Pagination,
    Drawer
} from "@mantine/core";
import localFont from "next/font/local";

const abcMonumentGrotesk = localFont({
    src: [
        {
            path: '../assets/fonts/ABCMonumentGrotesk-Light.otf',
            weight: '300',
            style: 'normal'
        },
        {
            path: '../assets/fonts/ABCMonumentGrotesk-Regular.otf',
            weight: '400',
            style: 'normal'
        },
        {
            path: '../assets/fonts/ABCMonumentGrotesk-Medium.otf',
            weight: '500',
            style: 'normal'
        },
        {
            path: '../assets/fonts/ABCMonumentGrotesk-Bold-Trial.otf',
            weight: '700',
            style: 'normal'
        }
    ]
});

const inputTheme: any = {
    defaultProps: {
        inputWrapperOrder: ['label', 'input', 'error', 'description']
    },
    classNames: {
        label: 'font-normal uppercase',
        description: 'font-normal mt-1'
    },
    styles: {
        input: {
            color: 'var(--mantine-color-gray-text)'
        },
        label: {
            color: 'var(--mantine-color-gray-text)'
        },
        description: {
            whiteSpace: 'pre-line'
        }
    }
};

export const defaultThemeOverride: MantineThemeOverride = {
    fontFamily: abcMonumentGrotesk.style.fontFamily,
    cursorType: 'pointer',
    colors: {
        flare: [
            "#ffeaf1",
            "#fed3df",
            "#f6a5bc",
            "#ef7497",
            "#ea4b77",
            "#e73163",
            "#e62259",
            "#cd144a",
            "#b80941",
            "#a20037"
        ],
        primary: [
            '#e5f6ff',
            '#d0eafe',
            '#a5d0f6',
            '#74b6ef',
            '#4da0ea',
            '#3392e7',
            '#228be6',
            '#1078cd',
            '#006ab9',
            '#005ca4'
        ]
    },
    components: {
        Table: Table.extend({
            classNames: {
                th: 'font-normal text-xs',
                td: 'text-sm bg-white'
            },
            styles: {
                th: {
                    color: 'rgba(119, 119, 119, 1)',
                    backgroundColor: 'rgba(251, 251, 251, 1)',
                    borderBottom: '1px solid rgba(231, 231, 231, 1)'
                },
                td: {
                    borderBottom: '1px solid rgba(231, 231, 231, 1)'
                },
                table: {
                    border: '1px solid rgba(231, 231, 231, 1)',
                    boxShadow: '0px 7px 7px -5px rgba(0, 0, 0, 0.0392)',
                    borderCollapse: 'separate',
                    borderSpacing: 0
                }
            }
        }),
        Modal: Modal.extend({
            defaultProps: {
                closeOnClickOutside: false
            },
            styles: {
                title: {
                    fontSize: '1.5rem'
                },
                close: {
                    width: '30px',
                    height: '30px',
                }
            }
        }),
        NumberInput: NumberInput.extend(inputTheme),
        TextInput: TextInput.extend(inputTheme),
        Switch: Switch.extend({
            defaultProps: {
                color: 'var(--mantine-color-black)'
            }
        }),
        Stepper: Stepper.extend({
            styles: {
                verticalSeparator: {
                    borderColor: 'var(--mantine-color-gray-5)'
                }
            },
            classNames: {
                content: 'pt-0',
                separator: 'hidden'
            }
        }),
        Checkbox: Checkbox.extend({
            defaultProps: {
                color: 'var(--mantine-color-black)'
            }
        }),
        Pagination: Pagination.extend({
            defaultProps: {
                color: 'var(--mantine-color-black)'
            }
        }),
        Drawer: Drawer.extend({
            styles: {
                close: {
                    transform: 'scale(1.5)'
                }
            }
        }),
    }
}
