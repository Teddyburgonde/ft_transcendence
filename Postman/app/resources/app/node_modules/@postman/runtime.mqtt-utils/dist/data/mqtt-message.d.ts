export declare enum MQTTMessageBodyType {
    TEXT = "text",
    BINARY = "binary",
    JSON = "json",
    POSTMAN_JSON = "postman_json",
    BASE64 = "base64",
    HEX = "hex"
}
export interface UserProperties {
    key: string;
    value: string | number | boolean;
    disabled?: boolean;
    description?: string;
}
export type QoS = 0 | 1 | 2;
export interface MessageProperties {
    payloadFormatIndicator?: boolean;
    messageExpiryInterval?: number;
    topicAlias?: number;
    responseTopic?: string;
    correlationData?: string;
    subscriptionIdentifier?: number;
    contentType?: string;
    userProperties?: Omit<UserProperties, 'disabled' | 'description'>[];
}
export interface MqttMessage {
    payload: string;
    topic: string;
    type: MQTTMessageBodyType.TEXT | MQTTMessageBodyType.JSON | MQTTMessageBodyType.HEX | MQTTMessageBodyType.BASE64;
    qos: QoS;
    retain: boolean;
    properties?: MessageProperties;
}
export interface SubscriptionMessage {
    name: string;
    qos: QoS;
    subscribe: boolean;
    settings?: {
        noLocal?: boolean;
        retainAsPublished?: boolean;
        retainHandling?: 0 | 1 | 2;
        subscriptionIdentifier?: number;
    };
    userProperties?: Omit<UserProperties, 'disabled' | 'description'>[];
}
