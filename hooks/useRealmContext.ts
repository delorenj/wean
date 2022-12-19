import Realm from 'realm';
import {createRealmContext} from "@realm/react";

// Define the Realm object type
const UserSchema = {
    name: 'User',
    properties: {
        name: 'string',
        age: 'int'
    }
};

const SettingsSchema: Realm.ObjectSchema = {
    name: 'Settings',
    properties: {
        darkMode: 'bool'
    }
};

// Define the Realm configuration
const realmConfig: Realm.Configuration = {
    path: 'data.realm',
    schema: [UserSchema, SettingsSchema]
};

// Create the Realm Context
export const RealmContext = createRealmContext(realmConfig);
