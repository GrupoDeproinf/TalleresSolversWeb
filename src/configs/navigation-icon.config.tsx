import {
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
import CustomIcon from '@/components/icons/subscriptionicon'
import UserListIcon from '@/components/icons/Userlisticon'
import GarageIcon from '@/components/icons/garageicon'
import ServicesTemplatesIcon from '@/components/icons/servicestemplate'
import CategoryIcon from '@/components/icons/categoryicon'
import ServecesxGarage from '@/components/icons/servicesxgaregeicon'
import PlansIcon from '@/components/icons/plansicon'
import AnalyticsUpIcon from '@/components/icons/dashtboardicon'
import { IoIosContacts } from 'react-icons/io'
import { FaRegStar } from 'react-icons/fa'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    apps: <HiOutlineViewGridAdd />,
    project: <AnalyticsUpIcon />,
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
    user: <UserListIcon></UserListIcon>,
    cars: <GarageIcon></GarageIcon>,
    tools: <ServicesTemplatesIcon />,
    category: <CategoryIcon />,
    serviceGarage: <ServecesxGarage />,
    plans: <PlansIcon />,
    subscriptions: <CustomIcon></CustomIcon>,
    ServiceContact: <IoIosContacts ></IoIosContacts>,
    Puntuacion: <FaRegStar></FaRegStar>,
}

export default navigationIcon
