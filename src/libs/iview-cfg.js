import Vue from 'vue';
import ViewUI from 'view-design';
import { ResError } from '@/libs//error/ResError';
import ZkTable from 'vue-table-with-tree-grid'

ViewUI.Message.config({
    duration: 4
});
//全局引入
Vue.use(ViewUI)
Vue.use(ZkTable)

export const errorHandler = (error, vm)=>{
    ViewUI.Message.destroy()
    if(!(error instanceof ResError)){
        ViewUI.Message.error("错误信息:" + error.message + ",请联系管理员修复");
    }else{
        ViewUI.Message.error(error.message);
    }
}

Vue.config.errorHandler = errorHandler;
Vue.prototype.$throw = (error)=> errorHandler(error,this);
