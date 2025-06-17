import type React from "react"
import { ScrollView as RNScrollView, type ScrollViewProps } from "react-native"

// This is a simple wrapper component to fix the issue with the ScrollView
// component in the AddEditTaskScreen.tsx file
const ScrollView: React.FC<ScrollViewProps> = ({ children, ...props }) => {
  return <RNScrollView {...props}>{children}</RNScrollView>
}

export default ScrollView

