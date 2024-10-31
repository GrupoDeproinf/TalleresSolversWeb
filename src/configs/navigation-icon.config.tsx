import { FaRegUser, FaTools } from 'react-icons/fa'
import {
    HiOutlineChartSquareBar,
    HiOutlineUserGroup,
    HiOutlineTrendingUp,
    HiOutlineUserCircle,
    HiOutlineBookOpen,
    HiOutlineCurrencyDollar,
    HiOutlineShieldCheck,
    HiOutlineColorSwatch,
    HiOutlineChatAlt,
    HiOutlineDesktopComputer,
    HiOutlinePaperAirplane,
    HiOutlineChartPie,
    HiOutlineUserAdd,
    HiOutlineKey,
    HiOutlineBan,
    HiOutlineHand,
    HiOutlineDocumentText,
    HiOutlineTemplate,
    HiOutlineLockClosed,
    HiOutlineDocumentDuplicate,
    HiOutlineViewGridAdd,
    HiOutlineShare,
    HiOutlineVariable,
    HiOutlineCode,
} from 'react-icons/hi'
import { BiSolidCategoryAlt } from "react-icons/bi";
import { GiMechanicGarage } from "react-icons/gi";
import { IoCarSportOutline } from 'react-icons/io5'
import { VscTools } from 'react-icons/vsc'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    apps: <HiOutlineViewGridAdd />,
    project: <HiOutlineChartSquareBar />,
    crm: <HiOutlineUserGroup />,
    sales: <HiOutlineTrendingUp />,
    crypto: <HiOutlineCurrencyDollar />,
    knowledgeBase: <HiOutlineBookOpen />,
    account: <HiOutlineUserCircle />,
    uiComponents: <HiOutlineTemplate />,
    common: <HiOutlineColorSwatch />,
    feedback: <HiOutlineChatAlt />,
    dataDisplay: <HiOutlineDesktopComputer />,
    forms: <HiOutlineDocumentText />,
    navigation: <HiOutlinePaperAirplane />,
    graph: <HiOutlineChartPie />,
    authentication: <HiOutlineLockClosed />,
    signIn: <HiOutlineShieldCheck />,
    signUp: <HiOutlineUserAdd />,
    forgotPassword: <HiOutlineLockClosed />,
    resetPassword: <HiOutlineKey />,
    pages: <HiOutlineDocumentDuplicate />,
    welcome: <HiOutlineHand />,
    accessDenied: <HiOutlineBan />,
    guide: <HiOutlineBookOpen />,
    documentation: <HiOutlineDocumentText />,
    sharedComponentDoc: <HiOutlineShare />,
    utilsDoc: <HiOutlineVariable />,
    changeLog: <HiOutlineCode />,
    user: <FaRegUser />,
    cars: <IoCarSportOutline />,
    tools: <VscTools />,
    category: <BiSolidCategoryAlt />,
    serviceGarage: <GiMechanicGarage />,
}

export default navigationIcon
