import config from "../../config";
import CommonType from "./types";

enum ActiveState {
    ON,
    PENDING,
    OFF
}

type List = {
    list: CommonType.List,
    activeState: ActiveState[]
}

export default class ListHandler {
    private lists: List[];
    private guides: CommonType.Guide[];
    private forceUpdate: () => void;

    constructor(username: string, guides: CommonType.Guide[], forceUpdate: () => void) {
        this.lists = [];
        this.guides = guides;
        this.forceUpdate = forceUpdate;
        this.initLists(username);
    }

    private initLists = (username: string) => {
        fetch(config.endpoints.getLists, {
            method: "POST",
            body: JSON.stringify({ username: username })
        })
            .then(res => res.json())
            .then(data => {
                this.lists = data.collections.map((x: CommonType.List) => ({
                    list: x,
                    activeState: this.guides.map(y =>
                        x.guides.includes(y.id) ? ActiveState.ON : ActiveState.OFF
                    )
                }));
                this.forceUpdate();
            });
    }

    toggleListInclude = async (id: string, i: number) => {
        // Get index
        if (!this.lists) return;
        const index = this.lists?.findIndex(x => x.list.id === id);
        if (index === -1) return;

        // Update state
        const targetList: List = this.lists[index];
        const newState = targetList.activeState[i] === ActiveState.ON ? ActiveState.OFF : ActiveState.ON;
        targetList.activeState[i] = ActiveState.PENDING;
        await this.forceUpdate();
        this.lists[index] = targetList;

        // Add/Remove guide from list
        const existingIndex = targetList.list.guides.indexOf(this.guides[i].id);
        if (existingIndex === -1) targetList.list.guides.push(this.guides[i].id);
        else targetList.list.guides.splice(existingIndex, 1);

        targetList.activeState[i] = newState;
        this.lists[index] = targetList;
        await fetch(config.endpoints.updateList, {
            method: "POST",
            body: JSON.stringify(targetList.list)
        }).then(res => res.json())
            .then(_ => this.forceUpdate());
    }

    getLists = () => this.lists

}