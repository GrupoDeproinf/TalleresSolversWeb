import{j as e}from"./index-_feUBWkF.js";import{S as i}from"./SyntaxHighlighter-RGzVEGmi.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const c=()=>e.jsxs(e.Fragment,{children:[e.jsxs("p",{children:["To initialize the app direction, simply set"," ",e.jsx("code",{children:"direction"})," field as",e.jsx("code",{children:"'ltr'"})," or ",e.jsx("code",{children:"'rtl'"})," in"," ",e.jsx("code",{children:"src/configs/theme.config.ts"}),". For example:"]}),e.jsx(i,{language:"ts",children:`export const themeConfig = {
	...
	direction: 'rtl'
}`}),e.jsxs("div",{className:"mt-10",id:"hook",children:[e.jsx("h5",{children:"Hook"}),e.jsx("p",{className:"mt-1",children:"You can access or update the direction in a component via our prepared hook."}),e.jsx(i,{language:"tsx",children:`import React from 'react'
import Button from '@/components/ui/Button'
import InputGroup from '@/components/ui/InputGroup'
import useDirection from '@/utils/hooks/useDirection'
import type { Direction } from '@/@types/theme';

const dirList = [
	{ value: 'ltr', label: 'LTR' },
	{ value: 'rtl', label: 'RTL' }
]

const DirectionSwitcher = () => {

	const [direction, updateDirection] = useDirection()

	const onDirChange = (val: Direction) => {
		updateDirection(val)
	}

	return (
		<InputGroup size="sm">
			{
				dirList.map(dir => (
					<Button 
						key={dir.value}
						active={direction === dir.value}
						onClick={() => onDirChange(dir.value)}
					>
						{dir.label}
					</Button>
				))
			}
		</InputGroup>
	)
}

export default DirectionSwitcher
`})]})]});export{c as default};
