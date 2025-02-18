from tempfile import template
import dash
import pandas as pd
import plotly.graph_objects as go
from dash import Dash, dcc, html, Input, Output, State, callback_context
import dash_bootstrap_components as dbc
from flask import Flask, jsonify
import io
from dash_bootstrap_templates import ThemeChangerAIO, template_from_url

# Data Handling Class
class DataHandler:
    def __init__(self, file_path):
        self.df = pd.read_csv(file_path)
        self.validate_columns()

    def validate_columns(self):
        required_columns = [
            "EFF_YEAR", "TX_SIGNED_HIGHWAY_RDBD_ID", "DETAILED_PAV_TYPE",
            "TX_BEG_REF_MARKER_NBR", "TX_END_REF_MARKER_NBR", "TX_LENGTH",
            "TX_CONDITION_SCORE", "TX_DISTRESS_SCORE", "TX_RIDE_SCORE",
            "TX_CRCP_SPALLED_CRACKS_QTY", "TX_JCP_PCC_PATCHES_QTY", "TX_CRCP_PUNCHOUT_QTY", "TX_CRCP_ACP_PATCHES_QTY"
        ]
        missing_cols = [col for col in required_columns if col not in self.df.columns]
        if missing_cols:
            raise ValueError(f"Missing columns: {missing_cols}")

    def get_unique_values(self, column):
        if column == 'TX_SIGNED_HIGHWAY_RDBD_ID':
            values = self.df[column].unique()
            def sort_key(x):
                parts = x.split()
                prefix = parts[0] if len(parts) > 0 else ""
                number = float(''.join(c for c in parts[1] if c.isdigit() or c == '.')) if len(parts) > 1 and any(c.isdigit() for c in parts[1]) else 0
                return (prefix, number)
            return sorted(values, key=sort_key)
        return sorted(self.df[column].unique())

    def filter_data(self, filters):
        filtered_df = self.df.copy()
        for key, value in filters.items():
            if value and value != 'all':
                if key == 'year':
                    filtered_df = filtered_df[filtered_df['EFF_YEAR'].isin(value if isinstance(value, list) else [value])]
                elif key == 'highway':
                    filtered_df = filtered_df[filtered_df['TX_SIGNED_HIGHWAY_RDBD_ID'].isin(value if isinstance(value, list) else [value])]
                elif key == 'begin_rm':
                    filtered_df = filtered_df[filtered_df['TX_BEG_REF_MARKER_NBR'].isin(value)]
                elif key == 'end_rm':
                    filtered_df = filtered_df[filtered_df['TX_END_REF_MARKER_NBR'].isin(value)]
                elif key == 'displacement1':
                    min_disp = min(v for v in value if v != 'all')
                    filtered_df = filtered_df[filtered_df['TX_LENGTH'] >= min_disp]
                elif key == 'displacement2':
                    max_disp = max(v for v in value if v != 'all')
                    filtered_df = filtered_df[filtered_df['TX_LENGTH'] <= max_disp]
        return filtered_df

    def calculate_condition_score(self, filtered_df):
        if filtered_df.empty or filtered_df['TX_LENGTH'].sum() == 0:
            return 0
        return (filtered_df['TX_CONDITION_SCORE'] * filtered_df['TX_LENGTH']).sum() / filtered_df['TX_LENGTH'].sum()

# Initialize data handler
data_handler = DataHandler("/Users/amauriribeiro/RPDBA/public/files/Concrete_distressesPmis.csv")

# Initialize Flask server
server = Flask(__name__)

# Add the stylesheet
dbc_css = "https://cdn.jsdelivr.net/gh/AnnMarieW/dash-bootstrap-templates/dbc.min.css"

# Initialize Dash app
app = Dash(__name__, 
          server=server, 
          external_stylesheets=[dbc.themes.BOOTSTRAP, dbc.icons.FONT_AWESOME, dbc_css],
          suppress_callback_exceptions=True)  # Add this line

def create_dropdown(id, options, placeholder, multi=True, value=None):
    return dcc.Dropdown(
        id=id,
        options=options,
        placeholder=placeholder,
        multi=multi,
        value=value,
        searchable=True,
        clearable=True,
        style={'minWidth': '200px'}
    )

# filter_controls definition to include the checklist containers
filter_controls = dbc.Card([
    dbc.Row([
        # Highway dropdown 
        dbc.Col([
            html.Div("Highway", style={'marginBottom': '10px'}),
            create_dropdown(
                id='highway-filter',
                options=[{'label': str(val), 'value': val} for val in data_handler.get_unique_values('TX_SIGNED_HIGHWAY_RDBD_ID')],
                placeholder="Select Highway",
                multi=False,
                value="IH0040 L"
            )
        ], width=2),
        #  Begin RM section
        dbc.Col([
            html.Div([
                html.Div([  # Added container for label and button
                    dbc.Label("Begin RM", className="mb-2 d-block"),  # Added d-block to ensure label is on its own line
                    html.Div([  # Container for buttons
                        dbc.Button(
                            "Show/Hide Values",
                            id="begin-rm-collapse-button",
                            color="secondary",
                            size="sm",
                            className="me-1",  # Add margin to separate buttons
                        ),
                        dbc.Button(
                            html.I(className="fas fa-times", style={'color': '#6c757d'}),  # Grey color
                            id="begin-rm-clear-button",
                            color="light",  # Changed from danger to light
                            size="sm",
                            className="px-2",  # Add padding for better icon display
                        ),
                    ], className="d-flex"),  # Use flex to align buttons
                ]),
                dbc.Collapse(
                    html.Div(
                        dcc.Checklist(
                            id='begin-rm-filter',
                            options=[
                                {'label': 'Select All', 'value': 'all'},  # Add Select All option
                                *[{'label': f'RM {str(val)}', 'value': val}
                                  for val in sorted(data_handler.get_unique_values('TX_BEG_REF_MARKER_NBR'))]
                            ],
                            value=[],
                            className='dbc',
                            inputStyle={'marginRight': '5px'},
                            labelStyle={'display': 'block', 'padding': '2px 0'}
                        ),
                        id="begin-rm-container",  # Add ID for mouse events
                        style={
                            'position': 'absolute',  # Add absolute positioning
                            'zIndex': '1000',        # Ensure it appears on top
                            'maxHeight': '300px',    # Increased max height
                            'overflowY': 'auto',
                            'overflowX': 'hidden',
                            'width': '200px',        # Fixed width
                            'border': '1px solid #e0e0e0',
                            'borderRadius': '4px',
                            'padding': '8px',
                            'backgroundColor': 'white',
                            'boxShadow': '0 4px 8px rgba(0,0,0,0.1)',
                            'marginTop': '5px'       # Space below button
                        }
                    ),
                    id="begin-rm-collapse",
                    is_open=False,
                ),
            ], className="dbc", style={'position': 'relative'}, id="begin-rm-wrapper")  # Added relative positioning to container
        ], width=2),
        # Updated Beg Displacement section
        dbc.Col([
            html.Div([
                html.Div([
                    dbc.Label("Beg Displacement", className="mb-2 d-block"),
                    html.Div([
                        dbc.Button(
                            "Show/Hide Values",
                            id="displacement1-collapse-button",
                            color="secondary",
                            size="sm",
                            className="me-1",
                        ),
                        dbc.Button(
                            html.I(className="fas fa-times", style={'color': '#6c757d'}),  # Grey color
                            id="displacement1-clear-button",
                            color="light",  # Changed to light
                            size="sm",
                            className="px-2",
                        ),
                    ], className="d-flex"),
                ]),
                dbc.Collapse(
                    html.Div(
                        dcc.Checklist(
                            id='displacement1-filter',
                            options=[
                                {'label': 'No Displacement (0)', 'value': 0},
                                {'label': 'Half Mile (0.5)', 'value': 0.5},
                                {'label': 'Point Seven (0.7)', 'value': 0.7}
                            ],
                            value=[],
                            className='dbc',
                            inputStyle={'marginRight': '5px'},
                            labelStyle={'display': 'block', 'padding': '2px 0'}
                        ),
                        style={
                            'position': 'absolute',  # Add absolute positioning
                            'zIndex': '1000',        # Ensure it appears on top
                            'maxHeight': '300px',    # Increased max height
                            'overflowY': 'auto',
                            'overflowX': 'hidden',
                            'width': '200px',        # Fixed width
                            'border': '1px solid #e0e0e0',
                            'borderRadius': '4px',
                            'padding': '8px',
                            'backgroundColor': 'white',
                            'boxShadow': '0 4px 8px rgba(0,0,0,0.1)',
                            'marginTop': '5px'       # Space below button
                        }
                    ),
                    id="displacement1-collapse",
                    is_open=False,
                ),
            ], className="dbc", style={'position': 'relative'})  # Add relative positioning to container
        ], width=2),

        # Updated End RM section
        dbc.Col([
            html.Div([
                html.Div([
                    dbc.Label("End RM", className="mb-2 d-block"),
                    html.Div([
                        dbc.Button(
                            "Show/Hide Values",
                            id="end-rm-collapse-button",
                            color="secondary",
                            size="sm",
                            className="me-1",
                        ),
                        dbc.Button(
                            html.I(className="fas fa-times", style={'color': '#6c757d'}),  # Grey color
                            id="end-rm-clear-button",
                            color="light",  # Changed to light
                            size="sm",
                            className="px-2",
                        ),
                    ], className="d-flex"),
                ]),
                dbc.Collapse(
                    html.Div(
                        dcc.Checklist(
                            id='end-rm-filter',
                            options=[{'label': f'RM {str(val)}', 'value': val}
                                    for val in sorted(data_handler.get_unique_values('TX_END_REF_MARKER_NBR'))],
                            value=[],
                            className='dbc',
                            inputStyle={'marginRight': '5px'},
                            labelStyle={'display': 'block', 'padding': '2px 0'}
                        ),
                        style={
                            'position': 'absolute',
                            'zIndex': '1000',
                            'maxHeight': '300px',
                            'overflowY': 'auto',
                            'width': '200px',
                            'border': '1px solid #e0e0e0',
                            'borderRadius': '4px',
                            'padding': '8px',
                            'backgroundColor': 'white',
                            'boxShadow': '0 4px 8px rgba(0,0,0,0.1)',
                            'marginTop': '5px'
                        }
                    ),
                    id="end-rm-collapse",
                    is_open=False,
                ),
            ], className="dbc", style={'position': 'relative'})
        ], width=2),

        # Updated End Displacement section
        dbc.Col([
            html.Div([
                html.Div([
                    dbc.Label("End Displacement", className="mb-2 d-block"),
                    html.Div([
                        dbc.Button(
                            "Show/Hide Values",
                            id="displacement2-collapse-button",
                            color="secondary",
                            size="sm",
                            className="me-1",
                        ),
                        dbc.Button(
                            html.I(className="fas fa-times", style={'color': '#6c757d'}),  # Grey color
                            id="displacement2-clear-button",
                            color="light",  # Changed to light
                            size="sm",
                            className="px-2",
                        ),
                    ], className="d-flex"),
                ]),
                dbc.Collapse(
                    html.Div(
                        dcc.Checklist(
                            id='displacement2-filter',
                            options=[
                                {'label': 'No Displacement (0)', 'value': 0},
                                {'label': 'Half Mile (0.5)', 'value': 0.5},
                                {'label': 'Point Seven (0.7)', 'value': 0.7}
                            ],
                            value=[],
                            className='dbc',
                            inputStyle={'marginRight': '5px'},
                            labelStyle={'display': 'block', 'padding': '2px 0'}
                        ),
                        style={
                            'position': 'absolute',  
                            'zIndex': '1000',        
                            'maxHeight': '300px',    
                            'overflowY': 'auto',
                            'overflowX': 'hidden',
                            'width': '200px',        # Fixed width
                            'border': '1px solid #e0e0e0',
                            'borderRadius': '4px',
                            'padding': '8px',
                            'backgroundColor': 'white',
                            'boxShadow': '0 4px 8px rgba(0,0,0,0.1)',
                            'marginTop': '5px'       # Space below button
                        }
                    ),
                    id="displacement2-collapse",
                    is_open=False,
                ),
            ], className="dbc", style={'position': 'relative'})  # Added relative positioning to container
        ], width=2),
    ]),
 
    dbc.Row([
        dbc.Col([
            dbc.Button("Apply Filters", id="apply-filter", color="primary", className="me-2"),
            dbc.Button("Export Data", id="export-btn", color="success", className="me-2"),
            dcc.Download(id="download-data")
        ], width=12, className="text-center mt-3")
    ])
], body=True)

# App layout
app.layout = dbc.Container([
    dbc.Row(dbc.Col(html.H1("PMIS Data Analysis Dashboard"), className="text-center mb-4")),
    dbc.Row(dbc.Col(filter_controls)),
    dbc.Row(dbc.Col(
        html.Div(
            id='title-div',
            className="text-center mb-3",
            style={
                'backgroundColor': 'black',
                'color': 'white',
                'padding': '10px',
                'borderRadius': '5px',
                'opacity': '0.8',
                'fontSize': '16px',
                'fontWeight': 'bold'
            }
        )
    )),
    # Key Insights and Summary cards
    dbc.Row([
        dbc.Col(
            dbc.Card(
                dbc.CardBody([
                    html.H4("Key Insights", className="card-title", 
                           style={'color': '#2c3e50', 'borderBottom': '2px solid #3498db', 'paddingBottom': '10px'}),
                    html.P(
                        id='key-insights', 
                        className="card-text animated fadeIn",
                        style={
                            'whiteSpace': 'pre-wrap',
                            'fontSize': '13px',
                            'padding': '12px',
                            'backgroundColor': '#f8f9fa',
                            'borderLeft': '4px solid #3498db',
                            'marginTop': '10px',
                            'lineHeight': '1.6'
                        }
                    )
                ]),
                className="mt-4",
                style={'border': '1px solid #e0e0e0'}
            ), width=8
        ),
        dbc.Col(
            dbc.Card(
                dbc.CardBody([
                    html.H4("Summary", className="card-title",
                           style={'color': '#2c3e50', 'borderBottom': '2px solid #3498db', 'paddingBottom': '10px'}),
                    html.P(
                        id='summary', 
                        className="card-text animated fadeIn",
                        style={
                            'whiteSpace': 'pre-wrap',
                            'fontSize': '13px',
                            'padding': '12px',
                            'backgroundColor': '#f8f9fa',
                            'borderLeft': '4px solid #3498db',
                            'marginTop': '10px',
                            'lineHeight': '1.0'
                        }
                    )
                ]),
                className="mt-4",
                style={'border': '1px solid #e0e0e0'}
            ), width=4
        )
    ]),
    dbc.Row(dbc.Col(dcc.Graph(id='line-chart'))),
    dbc.Row(dbc.Col(dcc.Graph(id='bar-chart')))
], fluid=True, className="dbc")

@app.callback(
    [Output('begin-rm-filter', 'options'),
     Output('displacement1-filter', 'options'),
     Output('end-rm-filter', 'options'),
     Output('displacement2-filter', 'options')],
    [Input('highway-filter', 'value'),
     Input('begin-rm-filter', 'value'),
     Input('displacement1-filter', 'value'),
     Input('end-rm-filter', 'value'),
     Input('displacement2-filter', 'value')]
)
def update_filters(highway, begin_rm, displacement1, end_rm, displacement2):
    filters = {
        'highway': [highway] if highway else [],
        'begin_rm': begin_rm or [],
        'displacement1': displacement1 or [],
        'end_rm': end_rm or [],
        'displacement2': displacement2 or []
    }

    filtered_df = data_handler.filter_data(filters)

    begin_rm_options = [{'label': str(val), 'value': val} for val in sorted(filtered_df['TX_BEG_REF_MARKER_NBR'].unique())]
    displacement1_options = [{'label': '0', 'value': 0}, {'label': '0.5', 'value': 0.5}, {'label': '0.7', 'value': 0.7}]
    end_rm_options = [{'label': str(val), 'value': val} for val in sorted(filtered_df['TX_END_REF_MARKER_NBR'].unique())]
    displacement2_options = [{'label': '0', 'value': 0}, {'label': '0.5', 'value': 0.5}, {'label': '0.7', 'value': 0.7}]

    return begin_rm_options, displacement1_options, end_rm_options, displacement2_options

def create_empty_figure():
    fig = go.Figure()
    fig.update_layout(
        xaxis={'visible': False},
        yaxis={'visible': False},
        annotations=[{
            'text': 'No data available for selected filters',
            'showarrow': False,
            'font': {'size': 16}
        }]
    )
    return fig

def create_line_chart(yearly_data, title):
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=yearly_data['EFF_YEAR'], y=yearly_data['TX_DISTRESS_SCORE'], name='Distress Score', mode='lines+markers', line=dict(color='blue'), yaxis='y'))
    fig.add_trace(go.Scatter(x=yearly_data['EFF_YEAR'], y=yearly_data['TX_CONDITION_SCORE'], name='Condition Score', mode='lines+markers', line=dict(color='green'), yaxis='y'))
    fig.add_trace(go.Scatter(x=yearly_data['EFF_YEAR'], y=yearly_data['TX_RIDE_SCORE'], name='Ride Score', mode='lines+markers', line=dict(color='red'), yaxis='y2'))

    max_distress_score = yearly_data['TX_DISTRESS_SCORE'].max()
    max_condition_score = yearly_data['TX_CONDITION_SCORE'].max()
    max_ride_score = yearly_data['TX_RIDE_SCORE'].max()

    fig.update_layout(
        xaxis=dict(title='Year', tickmode='array', tickvals=sorted(yearly_data['EFF_YEAR'].unique()), ticktext=sorted(yearly_data['EFF_YEAR'].unique()), tickangle=-45, showgrid=True),
        yaxis=dict(title=dict(text='Distress & Condition Scores', font=dict(color='black')), range=[0, max(100, max(max_distress_score, max_condition_score) + 10)], side='left', showgrid=True, tickformat=',.0f'),
        yaxis2=dict(title=dict(text='Ride Score', font=dict(color='black')), range=[0, max(5, max_ride_score + 1)], side='right', overlaying='y', tickformat='.1f', showgrid=False),
        legend=dict(orientation='h', yanchor='bottom', y=1.02, xanchor='right', x=1, bgcolor='rgba(255,255,255,0.5)'),
        height=600,
        hovermode='x unified',
        hoverlabel=dict(bgcolor='white', font_size=12, font_family='Arial')
    )
    return fig

def create_bar_chart(bar_data):
    fig = go.Figure()
    fig.add_trace(go.Bar(x=bar_data['EFF_YEAR'], y=bar_data['ACP Patches/Mile'], name='ACP Patches', marker_color='green'))
    fig.add_trace(go.Bar(x=bar_data['EFF_YEAR'], y=bar_data['PCC Patches/Mile'], name='PCC Patches', marker_color='blue'))
    fig.add_trace(go.Bar(x=bar_data['EFF_YEAR'], y=bar_data['Spalled Cracks/Mile'], name='Spalled Cracks', marker_color='orange'))
    fig.add_trace(go.Bar(x=bar_data['EFF_YEAR'], y=bar_data['Punchouts/Mile'], name='Punchouts', marker_color='red'))

    max_y_value = max(bar_data['Spalled Cracks/Mile'].max(), bar_data['PCC Patches/Mile'].max(), bar_data['Punchouts/Mile'].max(), bar_data['ACP Patches/Mile'].max())

    fig.update_layout(
        xaxis=dict(title='Year', tickmode='array', tickvals=sorted(bar_data['EFF_YEAR'].unique()), ticktext=sorted(bar_data['EFF_YEAR'].unique()), tickangle=-45, showgrid=True),
        yaxis=dict(title='Distress per Mile', range=[0, max(10, max_y_value + 1)]),
        barmode='group',
        legend=dict(orientation='h', yanchor='bottom', y=1.02, xanchor='right', x=1, bgcolor='rgba(255,255,255,0.5)'),
        height=600,
        bargap=0.15,
        hovermode='x unified',
        hoverlabel=dict(bgcolor='white', font_size=12, font_family='Arial')
    )
    return fig

@app.callback(
    [Output('line-chart', 'figure'),
     Output('bar-chart', 'figure'),
     Output('download-data', 'data'),
     Output('summary', 'children'),
     Output('key-insights', 'children')],  # Removed title-div output
    [Input('apply-filter', 'n_clicks'),
     Input('export-btn', 'n_clicks')],
    [State('highway-filter', 'value'),
     State('begin-rm-filter', 'value'),
     State('displacement1-filter', 'value'),
     State('end-rm-filter', 'value'),
     State('displacement2-filter', 'value')]
)
def update_charts_and_summary(apply_clicks, export_clicks, highway, begin_rm, displacement1, end_rm, displacement2):
    ctx = callback_context

    filtered_df = data_handler.filter_data({
        'highway': highway,
        'begin_rm': [v for v in (begin_rm or []) if v != 'all'],
        'end_rm': [v for v in (end_rm or []) if v != 'all'],
        'displacement1': [v for v in (displacement1 or []) if v != 'all'],
        'displacement2': [v for v in (displacement2 or []) if v != 'all']
    })

    if filtered_df.empty:
        empty_fig = create_empty_figure()
        return empty_fig, empty_fig, None, "No data available for selected filters", ""

    cs = data_handler.calculate_condition_score(filtered_df)
    yearly_data = filtered_df.groupby('EFF_YEAR').agg({
        'TX_DISTRESS_SCORE': 'mean',
        'TX_CONDITION_SCORE': 'mean',
        'TX_RIDE_SCORE': 'mean'
    }).reset_index()

    title = f'{highway}, RM: {begin_rm} + {displacement1} to {end_rm} + {displacement2}'

    line_fig = create_line_chart(yearly_data, title)
    bar_data = filtered_df.groupby('EFF_YEAR').agg({
        'TX_CRCP_SPALLED_CRACKS_QTY': 'sum',
        'TX_JCP_PCC_PATCHES_QTY': 'sum',
        'TX_CRCP_PUNCHOUT_QTY': 'sum',
        'TX_CRCP_ACP_PATCHES_QTY': 'sum',
        'TX_LENGTH': 'sum'
    }).reset_index()

    bar_data['Spalled Cracks/Mile'] = bar_data['TX_CRCP_SPALLED_CRACKS_QTY'] / bar_data['TX_LENGTH']
    bar_data['PCC Patches/Mile'] = bar_data['TX_JCP_PCC_PATCHES_QTY'] / bar_data['TX_LENGTH']
    bar_data['Punchouts/Mile'] = bar_data['TX_CRCP_PUNCHOUT_QTY'] / bar_data['TX_LENGTH']
    bar_data['ACP Patches/Mile'] = bar_data['TX_CRCP_ACP_PATCHES_QTY'] / bar_data['TX_LENGTH']

    bar_fig = create_bar_chart(bar_data)

    if ctx.triggered and ctx.triggered[0]['prop_id'] == 'export-btn.n_clicks':
        buffer = io.StringIO()
        filtered_df.to_csv(buffer, index=False)
        buffer.seek(0)
        return line_fig, bar_fig, dcc.send_string(buffer.getvalue(), "filtered_data.csv"), "", ""

    total_records = len(filtered_df)
    avg_condition_score = data_handler.calculate_condition_score(filtered_df)
    max_distress_score = yearly_data['TX_DISTRESS_SCORE'].max()
    max_condition_score = yearly_data['TX_CONDITION_SCORE'].max()
    max_ride_score = yearly_data['TX_RIDE_SCORE'].max()

    summary = (
     
        f"Average Condition Score: {avg_condition_score:.2f}\n"
        f"Max Distress Score: {max_distress_score:.2f}\n"
        f"Max Condition Score: {max_condition_score:.2f}\n"
        f"Max Ride Score: {max_ride_score:.2f}"
    )

    key_insights = (
        f"1. The average condition score is {avg_condition_score:.2f}, indicating the overall condition of the pavement.\n"
        f"2. The maximum distress score recorded is {max_distress_score:.2f}, highlighting the worst affected areas.\n"
        f"3. The maximum ride score is {max_ride_score:.2f}, showing the best ride quality observed."
    )

    return line_fig, bar_fig, None, summary, key_insights

# Add new callback for real-time title updates
@app.callback(
    Output('title-div', 'children'),
    [Input('highway-filter', 'value'),
     Input('begin-rm-filter', 'value'),
     Input('displacement1-filter', 'value'),
     Input('end-rm-filter', 'value'),
     Input('displacement2-filter', 'value')]
)
def update_title(highway, begin_rm, displacement1, end_rm, displacement2):
    if not highway:
        return "Please select a highway"
    
    begin_str = f"RM {begin_rm}" if begin_rm else ""
    disp1_str = f" + {displacement1}" if displacement1 else ""
    end_str = f" to RM {end_rm}" if end_rm else ""
    disp2_str = f" + {displacement2}" if displacement2 else ""
    
    return f"{highway}{begin_str}{disp1_str}{end_str}{disp2_str}"

# Main chart callback
@server.route('/api/data', methods=['GET'])
def get_data():
    filtered_data = data_handler.filter_data(filters={})
    return jsonify(filtered_data.to_dict(orient='records'))

# Replace all toggle and clear callbacks with these combined callbacks
@app.callback(
    [Output('begin-rm-filter', 'value'),
     Output('begin-rm-collapse', 'is_open')],
    [Input('begin-rm-collapse-button', 'n_clicks'),
     Input('begin-rm-clear-button', 'n_clicks'),
     Input('begin-rm-filter', 'value')],
    [State('begin-rm-collapse', 'is_open'),
     State('begin-rm-filter', 'options')]
)
def handle_begin_rm(collapse_clicks, clear_clicks, selected_values, is_open, options):
    ctx = callback_context
    if not ctx.triggered:
        return dash.no_update, dash.no_update
    
    trigger_id = ctx.triggered[0]['prop_id'].split('.')[0]
    
    if trigger_id == "begin-rm-clear-button":
        return [], False
    elif trigger_id == "begin-rm-filter":
        if 'all' in selected_values:
            if len(selected_values) == 1:  # Only 'all' is selected
                all_values = [opt['value'] for opt in options if opt['value'] != 'all']
                return all_values, True
            else:
                return [], True
        return selected_values, True
    elif trigger_id == "begin-rm-collapse-button":
        return dash.no_update, not is_open
    return dash.no_update, is_open

@app.callback(
    [Output('displacement1-filter', 'value'),
     Output('displacement1-collapse', 'is_open')],
    [Input('displacement1-collapse-button', 'n_clicks'),
     Input('displacement1-clear-button', 'n_clicks'),
     Input('displacement1-filter', 'value')],
    [State('displacement1-collapse', 'is_open')]
)
def handle_displacement1(collapse_clicks, clear_clicks, selected_values, is_open):
    ctx = callback_context
    if not ctx.triggered:
        return dash.no_update, dash.no_update
    
    trigger_id = ctx.triggered[0]['prop_id'].split('.')[0]
    
    if trigger_id == "displacement1-clear-button":
        return [], False
    elif trigger_id == "displacement1-filter" and selected_values:
        return selected_values, False
    elif trigger_id == "displacement1-collapse-button":
        return dash.no_update, not is_open
    return dash.no_update, is_open

@app.callback(
    [Output('end-rm-filter', 'value'),
     Output('end-rm-collapse', 'is_open')],
    [Input('end-rm-collapse-button', 'n_clicks'),
     Input('end-rm-clear-button', 'n_clicks'),
     Input('end-rm-filter', 'value')],
    [State('end-rm-collapse', 'is_open')]
)
def handle_end_rm(collapse_clicks, clear_clicks, selected_values, is_open):
    ctx = callback_context
    if not ctx.triggered:
        return dash.no_update, dash.no_update
    
    trigger_id = ctx.triggered[0]['prop_id'].split('.')[0]
    
    if trigger_id == "end-rm-clear-button":
        return [], False
    elif trigger_id == "end-rm-filter" and selected_values:
        return selected_values, True  # Keep dropdown open for multiple selections
    elif trigger_id == "end-rm-collapse-button":
        return dash.no_update, not is_open
    return dash.no_update, is_open

@app.callback(
    [Output('displacement2-filter', 'value'),
     Output('displacement2-collapse', 'is_open')],
    [Input('displacement2-collapse-button', 'n_clicks'),
     Input('displacement2-clear-button', 'n_clicks'),
     Input('displacement2-filter', 'value')],
    [State('displacement2-collapse', 'is_open')]
)
def handle_displacement2(collapse_clicks, clear_clicks, selected_values, is_open):
    ctx = callback_context
    if not ctx.triggered:
        return dash.no_update, dash.no_update
    
    trigger_id = ctx.triggered[0]['prop_id'].split('.')[0]
    
    if trigger_id == "displacement2-clear-button":
        return [], False
    elif trigger_id == "displacement2-filter" and selected_values:
        return selected_values, False  # Match displacement1 behavior - close after selection
    elif trigger_id == "displacement2-collapse-button":
        return dash.no_update, not is_open
    return dash.no_update, is_open

if __name__ == '__main__':
    app.run_server(debug=True)

