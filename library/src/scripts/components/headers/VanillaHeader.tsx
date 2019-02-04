/*
 * @author Stéphane LaFlèche <stephane.l@vanillaforums.com>
 * @copyright 2009-2019 Vanilla Forums Inc.
 * @license GPL-2.0-only
 */

import * as React from "react";
import ReactDOM from "react-dom";
import MeBox from "@library/components/mebox/MeBox";
import { dummyLogoData } from "@library/components/mebox/state/dummyLogoData";
import { dummyMessagesData } from "@library/components/mebox/state/dummyMessagesData";
import { dummyNavigationData } from "@library/components/mebox/state/dummyNavigationData";
import { Devices, IDeviceProps } from "@library/components/DeviceChecker";
import { withDevice } from "@library/contexts/DeviceContext";
import { dummyUserDropDownData } from "@library/components/mebox/state/dummyUserDropDownData";
import classNames from "classnames";
import Container from "@library/components/layouts/components/Container";
import { Panel, PanelWidgetHorizontalPadding } from "@library/components/layouts/PanelLayout";
import HeaderLogo from "@library/components/mebox/pieces/HeaderLogo";
import VanillaHeaderNav from "@library/components/mebox/pieces/VanillaHeaderNav";
import CompactSearch from "@library/components/mebox/pieces/CompactSearch";
import CompactMeBox from "@library/components/mebox/pieces/CompactMeBox";
import { connect } from "react-redux";
import { INotificationsProps } from "@library/components/mebox/pieces/NotificationsContents";
import UsersModel, { IInjectableUserState } from "@library/users/UsersModel";
import MobileDropDown from "@library/components/headers/pieces/MobileDropDown";
import ConditionalWrap from "@library/components/ConditionalWrap";
import FlexSpacer from "@library/components/FlexSpacer";
import BackLink from "@library/components/navigation/BackLink";
import VanillaHeaderNavItem from "@library/components/mebox/pieces/VanillaHeaderNavItem";
import { withPages, IWithPagesProps } from "@library/contexts/PagesContext";
import { t } from "@library/application";
import { ScrollOffsetContext } from "@library/contexts/ScrollOffsetContext";
import vanillaHeaderClasses from "@library/components/headers/vanillaHeaderStyles";

interface IProps extends IDeviceProps, IInjectableUserState, IWithPagesProps {
    container?: Element; // Element containing header. Should be the default most if not all of the time.
    className?: string;
    title?: string; // Needed for mobile dropdown
    mobileDropDownContent?: React.ReactNode; // Needed for mobile dropdown
    showSearchIcon?: boolean;
    isFixed?: boolean;
}

interface IState {
    openSearch: boolean;
    showingSuggestions: boolean;
    isScrolledOff: boolean;
}

/**
 * Implements Vanilla Header component. Note that this component uses a react portal.
 * That means the exact location in the page is not that important, since it will
 * render in a specific div in the default-master.
 */
export class VanillaHeader extends React.Component<IProps, IState> {
    public static contextType = ScrollOffsetContext;
    public context!: React.ContextType<typeof ScrollOffsetContext>;

    public static defaultProps: Partial<IProps> = {
        showSearchIcon: true,
        mobileDropDownContent: null,
        isFixed: true,
    };

    public state = {
        openSearch: false,
        showingSuggestions: false,
        isScrolledOff: false,
    };
    public render() {
        const { isFixed } = this.props;
        const { isScrolledOff } = this.state;
        const currentUser = this.props.currentUser.data;
        const isMobile = this.props.device === Devices.MOBILE;
        const isGuest = currentUser && UsersModel && currentUser.userID === UsersModel.GUEST_ID;
        const countClass = "vanillaHeader-count";
        const classes = vanillaHeaderClasses();
        const buttonClass = `vanillaHeader-button ${classes.button}`;
        const showMobileDropDown = isMobile && !this.state.openSearch && this.props.title;

        const notificationProps: INotificationsProps = {
            data: [],
            userSlug: currentUser!.name,
            countClass: classNames(countClass, classes.count, "vanillaHeader-notificationsCount"),
        };

        const messagesProps = {
            ...dummyMessagesData,
            buttonClass,
            countClass: classNames(countClass, classes.count, "vanillaHeader-messagesCount"),
        };

        return ReactDOM.createPortal(
            <>
                {isFixed && <div className={classNames("vanillaHeader-spacer", classes.spacer)} />}
                <header
                    className={classNames(
                        "vanillaHeader",
                        classes.root,
                        this.props.className,
                        { isFixed },
                        this.context.offsetClass,
                    )}
                >
                    <Container>
                        <Panel className="panelLayout-fullWidth">
                            <PanelWidgetHorizontalPadding>
                                <div className="vanillaHeader-bar">
                                    {!this.state.openSearch &&
                                        isMobile && (
                                            <BackLink
                                                className="vanillaHeader-leftFlexBasis vanillaHeader-backLink"
                                                linkClassName={classes.button}
                                                fallbackElement={<FlexSpacer className="pageHeading-leftSpacer" />}
                                            />
                                        )}

                                    {!isMobile && (
                                        <HeaderLogo
                                            {...dummyLogoData}
                                            className={classNames("vanillaHeader-logoContainer", classes.logoContainer)}
                                            logoClassName="vanillaHeader-logo"
                                        />
                                    )}
                                    {!this.state.openSearch &&
                                        !isMobile && (
                                            <VanillaHeaderNav
                                                {...dummyNavigationData}
                                                className={classNames("vanillaHeader-nav", classes.nav)}
                                                linkClassName={classNames("vanillaHeader-navLink", classes.topElement)}
                                                linkContentClassName="vanillaHeader-navLinkContent"
                                            />
                                        )}
                                    {showMobileDropDown && (
                                        <MobileDropDown
                                            title={this.props.title!}
                                            buttonClass={classNames("vanillaHeader-mobileDropDown", classes.topElement)}
                                        >
                                            {this.props.mobileDropDownContent}
                                        </MobileDropDown>
                                    )}

                                    <ConditionalWrap
                                        className={classNames("vanillaHeader-rightFlexBasis", classes.rightFlexBasis)}
                                        condition={!!showMobileDropDown}
                                    >
                                        {this.props.showSearchIcon ? (
                                            <CompactSearch
                                                className={classNames(
                                                    "vanillaHeader-compactSearch",
                                                    classes.compactSearch,
                                                    {
                                                        isCentered: this.state.openSearch,
                                                    },
                                                )}
                                                focusOnMount
                                                open={this.state.openSearch}
                                                onSearchButtonClick={this.openSearch}
                                                onCloseSearch={this.closeSearch}
                                                cancelButtonClassName={classNames(
                                                    "vanillaHeader-searchCancel",
                                                    classes.topElement,
                                                    classes.searchCancel,
                                                )}
                                                cancelContentClassName="meBox-contentHover"
                                                buttonClass={classes.button}
                                                showingSuggestions={this.state.showingSuggestions}
                                                onOpenSuggestions={this.setOpenSuggestions}
                                                onCloseSuggestions={this.setCloseSuggestions}
                                                buttonContentClass="meBox-buttonContent"
                                            />
                                        ) : (
                                            <FlexSpacer
                                                className={classNames(
                                                    "compactSearch",
                                                    "vanillaHeader-compactSearch",
                                                    classes.compactSearch,
                                                )}
                                            />
                                        )}
                                        {isGuest ? (
                                            (!this.state.openSearch || !isMobile) && (
                                                <VanillaHeaderNav
                                                    className={classNames(
                                                        "vanillaHeader-nav vanillaHeader-guestNav",
                                                        classes.nav,
                                                    )}
                                                >
                                                    <VanillaHeaderNavItem
                                                        linkClassName="button vanillaHeader-guestButton vanillaHeader-signIn"
                                                        to={`/entry/signin?target=${window.location.pathname}`}
                                                    >
                                                        {t("Sign in")}
                                                    </VanillaHeaderNavItem>
                                                    <VanillaHeaderNavItem
                                                        linkClassName="button vanillaHeader-guestButton vanillaHeader-register"
                                                        to={`/entry/register?target=${window.location.pathname}`}
                                                    >
                                                        {t("Register")}
                                                    </VanillaHeaderNavItem>
                                                </VanillaHeaderNav>
                                            )
                                        ) : (
                                            <React.Fragment>
                                                {!isMobile && (
                                                    <MeBox
                                                        className={classNames("vanillaHeader-meBox", classes.meBox)}
                                                        notificationsProps={notificationProps}
                                                        messagesProps={messagesProps as any}
                                                        counts={dummyUserDropDownData}
                                                        buttonClassName={classes.button}
                                                        contentClassName={classNames(
                                                            "vanillaHeader-dropDownContents",
                                                            classes.dropDownContents,
                                                        )}
                                                    />
                                                )}
                                                {isMobile &&
                                                    !this.state.openSearch && (
                                                        <CompactMeBox
                                                            className={classNames(
                                                                "vanillaHeader-button",
                                                                classes.button,
                                                            )}
                                                            counts={dummyUserDropDownData}
                                                            buttonClass={classNames(
                                                                "vanillaHeader-tabButton",
                                                                classes.tabButton,
                                                            )}
                                                            userPhotoClass="headerDropDown-user"
                                                        />
                                                    )}
                                            </React.Fragment>
                                        )}
                                    </ConditionalWrap>
                                </div>
                            </PanelWidgetHorizontalPadding>
                        </Panel>
                    </Container>
                </header>
            </>,
            this.props.container || document.getElementById("vanillaHeader")!,
        );
    }

    public componentDidMount() {
        this.context.setScrollOffset(48);
    }

    public componentWillUnmount() {
        this.context.resetScrollOffset();
    }

    public openSearch = () => {
        const { pages } = this.props;
        if (pages.search) {
            pages.search.preload();
        }
        this.setState({
            openSearch: true,
        });
    };

    public closeSearch = () => {
        this.setState({
            openSearch: false,
        });
    };

    /**
     * Keep track of visibility of suggestions
     */
    public setOpenSuggestions = () => {
        this.setState({
            showingSuggestions: true,
        });
    };

    /**
     * Keep track of visibility of suggestions
     */
    public setCloseSuggestions = () => {
        this.setState({
            showingSuggestions: false,
        });
    };
}

const withRedux = connect(UsersModel.mapStateToProps);
export default withPages(withRedux(withDevice<IProps>(VanillaHeader)));
