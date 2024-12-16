import { Title, Text } from "@mantine/core";
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

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            hasError: true,
            errorMessage: error?.message
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="mt-10 text-center">
                    <Title order={2} fw={700}>{this.props.t('error.title')}</Title>
                    {process.env.NODE_ENV === 'development'
                        ? <Text>{this.props.t('error.error_message', { message: this.state.errorMessage })}</Text>
                        : <Text>{this.props.t('error.try_again_label')}</Text>
                    }
                </div>
            );
        }

        return this.props.children;
    }
}

export default withTranslation()(ErrorBoundary);
