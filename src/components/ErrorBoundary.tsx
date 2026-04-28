import { Title, Text, Button } from "@mantine/core";
import React, { Component, ErrorInfo } from 'react';
import { withTranslation } from 'react-i18next';
import i18n from 'i18next';

interface Props {
    children: React.ReactNode;
    t: typeof i18n.t;
}

interface State {
    hasError: boolean;
    errorMessage: string;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, errorMessage: '' };
    }

    componentDidCatch(error: Error, _errorInfo: ErrorInfo) {
        this.setState({
            hasError: true,
            errorMessage: error?.message
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col flex-1 items-center justify-center text-center px-4">
                    <Title order={2} fw={500} className="text-32" c="var(--flr-black)">
                        {this.props.t('error.title')}
                    </Title>
                    <Text c="var(--flr-gray)" className="mt-2 text-16 max-w-xs">
                        {process.env.NODE_ENV === 'development'
                            ? this.props.t('error.error_message', { message: this.state.errorMessage })
                            : this.props.t('error.try_again_label')
                        }
                    </Text>
                    <Button
                        variant="filled"
                        color="black"
                        radius="xl"
                        size="lg"
                        fw={400}
                        className="mt-6 pl-12 pr-12 hover:text-white"
                        onClick={() => window.location.href = '/'}
                    >
                        {this.props.t('error.go_home_button')}
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default withTranslation()(ErrorBoundary);
