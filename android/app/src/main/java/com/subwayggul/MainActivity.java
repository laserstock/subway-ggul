package com.subwayggul;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ArrivalAlarmPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
