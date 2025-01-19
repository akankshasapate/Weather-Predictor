import AppNavigation from './navigation/AppNavigation';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
    "Non-serializable values were found in the navigation state",
]);

export default function App() {
    return <AppNavigation />;
}