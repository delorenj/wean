export interface ModelConverter {
    toFirestore(model: any): any
    fromFirestore(snapshot: any, options: any): any
}

export class Model {
    toString(): string {
        return '';
    }
}
