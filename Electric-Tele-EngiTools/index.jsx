import { AppRegistry } from 'react-native';
import App from './app';  // Adjust if your main file is located elsewhere
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
