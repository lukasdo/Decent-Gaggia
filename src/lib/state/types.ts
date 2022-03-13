
import { ChartComponentProps} from "react-chartjs-2";
export interface ServerToClientEvents {
    noArg: () => void;
    basic: (event: any) => void;
  }
  
  export interface ClientToServerEvents {
    hello: () => void;
  }
  
  export interface InterServerEvents {
    ping: () => void;
  }
  
  export interface SocketData {
    name: string;
    age: number;
  }

export interface IMessage {
    temp: number;
    brewTemp: number;
    brewTime: number;
}

export interface IChartProps {
}

export interface IChartState {
    update: boolean;
    temp: number;
    brewTemp: number[];
    brewTime: number[];

    setPoint: number;
    data: ChartComponentProps
}
